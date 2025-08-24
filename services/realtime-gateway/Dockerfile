# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY RealtimeGateway.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish "RealtimeGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Serve the application
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "RealtimeGateway.dll"]