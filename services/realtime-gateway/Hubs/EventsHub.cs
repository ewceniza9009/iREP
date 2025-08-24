using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace RealtimeGateway.Hubs;

// The [Authorize] attribute ensures that only clients who provide a valid JWT can connect.
[Authorize]
public class EventsHub : Hub
{
    private readonly ILogger<EventsHub> _logger;

    public EventsHub(ILogger<EventsHub> logger)
    {
        _logger = logger;
    }

    // This method is called automatically when a client connects.
    public override async Task OnConnectedAsync()
    {
        // The user's claims are automatically populated from the validated JWT.
        var tenantId = Context.User?.FindFirstValue("tenantId");
        var userId = Context.User?.FindFirstValue("id");

        if (!string.IsNullOrEmpty(tenantId))
        {
            // Add the connection to a private group named after their tenant ID.
            // This ensures that a message sent to this group will only be received
            // by users belonging to that tenant.
            await Groups.AddToGroupAsync(Context.ConnectionId, GetTenantGroupName(tenantId));
            _logger.LogInformation("Client {ConnectionId} (User: {UserId}) connected to group for Tenant {TenantId}", Context.ConnectionId, userId, tenantId);
        }
        else
        {
            _logger.LogWarning("Client {ConnectionId} connected with a valid JWT but without a tenantId claim.", Context.ConnectionId);
            Context.Abort(); // Disconnect clients that don't have a tenantId.
            return;
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            _logger.LogError(exception, "Client {ConnectionId} disconnected with error.", Context.ConnectionId);
        }
        else
        {
            var userId = Context.User?.FindFirstValue("id");
            _logger.LogInformation("Client {ConnectionId} (User: {UserId}) disconnected.", Context.ConnectionId, userId);
        }
        
        // SignalR automatically handles removing the connection from all groups.
        await base.OnDisconnectedAsync(exception);
    }
    
    // A simple helper to create a consistent group name.
    public static string GetTenantGroupName(string tenantId) => $"tenant:{tenantId}";
}