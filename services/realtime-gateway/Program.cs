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


// 1. Configure SignalR and add the Redis backplane
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnectionString, options => {
        options.Configuration.ChannelPrefix = "SignalR_iREP_";
        // To handle transient connection failures, set AbortOnConnectFail to false
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
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "iREP Real-time Gateway is running.");
app.MapHub<EventsHub>("/events");

app.Run();