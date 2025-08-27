// services/realtime-gateway/Program.cs

using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using RealtimeGateway.Hubs;
using RealtimeGateway.Services;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// --- Add services to the container ---

// Get configuration values and ensure they are not null
var redisConnectionString = builder.Configuration["Redis:ConnectionString"] ?? throw new InvalidOperationException("Redis:ConnectionString is not configured.");
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");
var corsOrigin = builder.Configuration["Cors:Origin"] ?? throw new InvalidOperationException("Cors:Origin is not configured.");

// Add a temporary logger to verify the CORS origin is read correctly at startup
using (var tempServices = builder.Services.BuildServiceProvider())
{
    var logger = tempServices.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("CORS Policy 'AllowFrontend' will be configured for origin: {CorsOrigin}", corsOrigin);
}

// 1. Configure SignalR and add the Redis backplane
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnectionString, options => {
        options.Configuration.ChannelPrefix = "SignalR_iREP_";
        options.Configuration.AbortOnConnectFail = false;
    });

// 2. Configure JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/events"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// 3. Add Authorization services
builder.Services.AddAuthorization();

// 4. Add the Redis Subscriber as a background service
builder.Services.AddHostedService<RedisSubscriberService>();

// 5. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(corsOrigin)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
        });
});


var app = builder.Build();

// --- Configure the HTTP request pipeline ---

app.UseRouting();

// This single global CORS middleware call is sufficient and should be placed here.
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "iREP Real-time Gateway is running.");

// The global CORS policy will apply to this hub mapping.
app.MapHub<EventsHub>("/events");

app.Run();