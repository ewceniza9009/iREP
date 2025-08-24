using Microsoft.AspNetCore.SignalR;
using RealtimeGateway.Hubs;
using StackExchange.Redis;

namespace RealtimeGateway.Services;

public class RedisSubscriberService : IHostedService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IHubContext<EventsHub> _hubContext;
    private readonly ILogger<RedisSubscriberService> _logger;

    public RedisSubscriberService(IConfiguration config, IHubContext<EventsHub> hubContext, ILogger<RedisSubscriberService> logger)
    {
        // Null check for robustness
        var redisConnectionString = config["Redis:ConnectionString"] ?? throw new ArgumentNullException(nameof(config), "Redis ConnectionString cannot be null.");
        
        // This is the corrected way to parse and configure the Redis connection
        var options = ConfigurationOptions.Parse(redisConnectionString);
        options.AbortOnConnectFail = false;
        _redis = ConnectionMultiplexer.Connect(options);

        _hubContext = hubContext;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Starting Redis Subscriber Service...");
        var subscriber = _redis.GetSubscriber();
        
        subscriber.Subscribe("tenant:*:updates").OnMessage(async channelMessage =>
        {
            _logger.LogInformation("Message received from Redis on channel {Channel}", channelMessage.Channel);
            
            string channelStr = channelMessage.Channel!;
            // The following line is incorrect and results in 'tenant:updates'
            // instead of 'tenant:{tenantId}'.
            // string groupName = channelStr.Substring(0, channelStr.LastIndexOf(":"));
            
            // Correct logic to get the group name
            var tenantId = channelStr.Split(":")[1];
            var groupName = EventsHub.GetTenantGroupName(tenantId);


            await _hubContext.Clients.Group(groupName).SendAsync("ReceiveUpdate", channelMessage.Message.ToString(), cancellationToken);
        });

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping Redis Subscriber Service.");
        _redis.Close();
        return Task.CompletedTask;
    }
}