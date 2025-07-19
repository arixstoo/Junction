# 🌊 Pond Monitoring Frontend - Backend API Integration

This Next.js frontend has been fully integrated with the backend MVP API for real-time pond monitoring. The application now provides live data, WebSocket connections, and comprehensive alert management.

## 🚀 Quick Start

1. **Start the Backend API Server** (must be running on `http://localhost:8000`)
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Start the frontend**:
   ```bash
   pnpm dev
   ```

## 🔐 Authentication

**Default Test Credentials:**
- Username: `admin`
- Password: `secret`

The login form is pre-populated with these credentials for easy testing.

## 📡 API Integration Features

### ✅ Implemented Components

#### 1. **API Client** (`/lib/api-client.ts`)
- Complete TypeScript client for all MVP API endpoints
- Authentication management with JWT tokens
- Error handling and response parsing
- WebSocket connection helper

#### 2. **Authentication System** (`/hooks/use-auth.ts`)
- React Context for authentication state
- Login/logout functionality
- Protected route handling
- Token persistence in localStorage

#### 3. **WebSocket Integration** (`/hooks/use-websocket.ts`)
- Real-time sensor data updates
- Live alert notifications
- Connection status monitoring
- Auto-reconnection with exponential backoff

#### 4. **Dashboard Hooks** (`/hooks/use-dashboard.ts`)
- Dashboard overview data fetching
- Individual pond data management
- Alert management with resolve functionality
- Auto-refresh capabilities

#### 5. **Enhanced Dashboard** (`/components/dashboard-component.tsx`)
- Real-time overview with live data
- System status monitoring
- WebSocket connection indicator
- Live sensor data display
- Real-time alert notifications

#### 6. **Enhanced Alerts Page** (`/components/enhanced-alerts-page.tsx`)
- Complete alert management interface
- Real-time alert updates via WebSocket
- Alert filtering and search
- One-click alert resolution
- Alert statistics and summaries

#### 7. **Enhanced Ponds Page** (`/components/enhanced-ponds-page.tsx`)
- Individual pond monitoring
- Real-time parameter updates
- Historical data viewing
- Parameter status indicators
- Live data highlighting

### 📊 API Endpoints Used

| Endpoint | Purpose | Implementation |
|----------|---------|----------------|
| `POST /auth/login` | User authentication | ✅ Login page |
| `GET /mvp/dashboard/overview` | Dashboard summary | ✅ Dashboard component |
| `GET /mvp/pond/{id}/latest` | Latest pond data | ✅ Pond details |
| `GET /mvp/pond/{id}/history` | Historical data | ✅ Pond history |
| `GET /mvp/pond/{id}/alerts` | Pond-specific alerts | ✅ Pond alerts |
| `GET /mvp/alerts/active` | All active alerts | ✅ Alerts page |
| `POST /mvp/alert/{id}/resolve` | Resolve alerts | ✅ Alert management |
| `GET /mvp/system/status` | System health | ✅ System monitoring |
| `WS /mvp/ws` | Real-time updates | ✅ WebSocket hooks |

### 🔄 Real-time Features

#### WebSocket Message Types
1. **`sensor_data`** - Live sensor readings from ponds
2. **`alert`** - Real-time alert notifications
3. **`pong`** - Connection heartbeat

#### Live Updates
- **Dashboard**: Sensor data updates every few seconds
- **Alerts**: Instant alert notifications
- **Ponds**: Real-time parameter changes
- **Connection Status**: Live connection monitoring

## 🔧 Configuration

### Environment Variables (`.env.local`)
```bash
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/mvp/ws

# Feature flags
NEXT_PUBLIC_ENABLE_WEBSOCKET=true
NEXT_PUBLIC_REFRESH_INTERVAL=30000

# Default credentials (development)
NEXT_PUBLIC_DEFAULT_USERNAME=admin
NEXT_PUBLIC_DEFAULT_PASSWORD=secret
```

## 📱 Component Structure

```
/components/
├── dashboard-component.tsx      # Main dashboard with live data
├── enhanced-alerts-page.tsx     # Complete alert management
├── enhanced-ponds-page.tsx      # Individual pond monitoring
└── navigation.tsx               # Updated with logout

/hooks/
├── use-auth.ts                  # Authentication management
├── use-dashboard.ts             # Data fetching hooks
└── use-websocket.ts             # WebSocket connections

/lib/
├── api-client.ts                # Complete API client
└── ...

/pages/
├── login-page.tsx               # Updated login with API
└── ...
```

## 🎯 Features Demonstration

### 1. **Live Dashboard**
- Real-time pond overview
- System status monitoring
- Live sensor data updates
- Active alert summaries
- WebSocket connection status

### 2. **Alert Management**
- View all active alerts
- Real-time alert notifications
- Filter alerts by severity/pond
- One-click alert resolution
- Alert statistics

### 3. **Pond Monitoring**
- Individual pond status
- Real-time parameter updates
- Historical data viewing
- Parameter status indicators
- Live data highlighting

### 4. **Authentication**
- Secure login with JWT tokens
- Protected routes
- Session persistence
- Automatic logout

## 🔍 Testing the Integration

### 1. **Backend Requirements**
Ensure the backend API is running with:
- Authentication endpoint working
- WebSocket server active
- Sample data available (3 ponds, alerts, readings)

### 2. **Frontend Testing**
1. **Login**: Use `admin` / `secret` credentials
2. **Dashboard**: Check live data updates and WebSocket status
3. **Alerts**: View active alerts and test resolution
4. **Ponds**: Monitor individual pond parameters
5. **Real-time**: Verify WebSocket messages in browser console

### 3. **Console Logs**
The application logs key events:
- `🔌 WebSocket connected`
- `📊 New sensor data received`
- `🚨 New alert received`
- `✅ Alert resolved successfully`

## 🚨 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Verify backend is running on `http://localhost:8000`
   - Check CORS settings on backend
   - Ensure authentication endpoint is accessible

2. **WebSocket Connection Issues**
   - Verify WebSocket server is running
   - Check browser console for connection errors
   - Try manual reconnection using the UI button

3. **Authentication Problems**
   - Clear localStorage and try again
   - Verify credentials: `admin` / `secret`
   - Check token expiration in browser dev tools

4. **No Real-time Updates**
   - Check WebSocket connection status
   - Verify backend is sending data
   - Look for errors in browser console

## 📚 API Documentation Reference

For complete API documentation, see `FRONTEND_API_DOCS.md` which includes:
- All endpoint specifications
- Request/response examples
- WebSocket message formats
- Authentication details
- Error handling

## 🔄 Data Flow

```
Backend API → API Client → React Hooks → Components → UI
     ↓
WebSocket → WebSocket Hook → Real-time Updates → Live UI
```

## 🎉 Success Indicators

When everything is working correctly, you should see:
- ✅ Successful login with admin/secret
- ✅ Dashboard showing pond data and statistics
- ✅ Green "Connected" WebSocket status
- ✅ Real-time sensor data updates in green cards
- ✅ Active alerts displayed and resolvable
- ✅ Individual pond monitoring with live updates
- ✅ Console logs showing WebSocket messages

The frontend is now fully integrated with the backend MVP API and ready for production use! 🌊📊
