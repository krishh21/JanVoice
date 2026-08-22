# JanVoice React Native Web Handoff

Build an exact React Native Web version of the existing JanVoice civic reporting web app.

## Goal

Create a new React Native Web app that matches the current JanVoice frontend design and functionality as closely as possible.

The app should work on:

- Web browser
- Mobile layout
- Future native mobile support through React Native / Expo

Keep the UI minimal, clean, and functional.

## Brand

- App name: `JanVoice`
- Logo file from current repo: `frontend/public/janVoice.webp`
- Header should show the JanVoice logo and app name.
- Do not use this old subtitle anywhere:
  - `Pothole, Garbage & Streetlight Tracker`

## Suggested Stack

Use Expo with React Native Web.

```bash
npx create-expo-app janvoice-native
cd janvoice-native
npm install axios
npm install @react-native-async-storage/async-storage
npm install react-native-web
```

Optional later:

```bash
npm install @react-navigation/native @react-navigation/native-stack
```

For first version, a simple state-based router is acceptable.

## Backend API

Use the existing backend API:

```txt
http://localhost:5000/api
```

Make this configurable through an environment value.

Important endpoints:

```txt
POST /auth/login
POST /auth/register
GET  /auth/profile
PUT  /auth/profile
POST /auth/forgot-password
PUT  /auth/reset-password/:resettoken

GET  /complaints
POST /complaints
GET  /complaints/:id
POST /complaints/:id/comments
POST /complaints/:id/like
POST /complaints/:id/vote
GET  /complaints/community/all

GET  /auth/users
GET  /admin/departments
POST /admin/departments
PUT  /admin/departments/:id
DELETE /admin/departments/:id
GET  /admin/analytics
```

JWT behavior:

- Save token after login/register.
- Use `Authorization: Bearer <token>` for private requests.
- Clear token on logout.
- If API returns `401`, logout and return to login.

## Auth Rules

Login should have only:

- Citizen Login
- Admin Login

Do not show Department Login.

Register should be citizen-only.

Do not include Aadhaar.

Register fields:

- Full name
- Email address
- Mobile number
- Address
- Password
- Confirm password

Email validation should reject fake-looking emails like:

```txt
abc@g.com
abc @g.com
```

Use the same rule as current frontend:

```js
const isRealisticEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z]{2,})+$/;
  if (!emailPattern.test(normalizedEmail)) return false;

  const [localPart, domain] = normalizedEmail.split('@');
  const provider = domain.split('.')[0];
  return localPart.length >= 3 && provider.length >= 2;
};
```

## Screens To Build

### 1. Login

Minimal split layout on web, stacked layout on mobile.

Features:

- Citizen/Admin segmented selection
- Email input
- Password input
- Forgot password link
- Register link
- On success:
  - Citizen goes to Dashboard
  - Admin goes to Admin Dashboard

Request:

```js
POST /auth/login
{
  email,
  password,
  role: "citizen" | "admin"
}
```

### 2. Register

Minimal citizen registration page.

No Aadhaar.

Request:

```js
POST /auth/register
{
  name,
  email,
  phone,
  address,
  password,
  role: "citizen"
}
```

### 3. Dashboard

Show:

- Greeting with user name
- Role
- Stats:
  - Total
  - Pending
  - In Progress
  - Resolved
- Quick actions:
  - New complaint
  - My complaints
  - Community
- Recent complaints list

Data:

```txt
GET /complaints
```

### 4. Complaints

Show user/admin complaints.

Features:

- Search
- Status filter
- Category filter
- Priority filter for admin/department
- Sort
- Refresh
- Complaint list

Data:

```txt
GET /complaints?sort=newest&status=Pending&category=Road%20%26%20Infrastructure&priority=High
```

### 5. New Complaint

Citizen-only.

Fields:

- Title
- Description
- Category
- Location address
- Images, optional

Categories:

```txt
Road & Infrastructure
Water Supply
Electricity
Sanitation & Waste
Public Safety
Healthcare
Education
Parks & Recreation
Traffic & Transportation
Others
```

Submit as multipart form data:

```txt
POST /complaints
```

Fields:

```txt
title
description
category
location[address]
images
```

### 6. Complaint Details

Show:

- Title
- Status
- Priority
- Description
- Images
- Complaint info
- Reporter
- Location
- Department
- Comments

Actions:

- Add comment
- Like/unlike community complaint
- Vote if keeping vote UI
- Admin/department status update

Important:

Citizens can view non-rejected community complaint details.

### 7. Community Complaints

Show public/non-rejected complaints.

Features:

- Filter status/category
- Sort newest/oldest/popular/most-commented
- Like/unlike
- Comment
- Open details

Data:

```txt
GET /complaints/community/all
```

### 8. Profile

Show and edit:

- Name
- Email
- Phone
- Address
- Optional password change

Data:

```txt
GET /auth/profile
PUT /auth/profile
```

### 9. Admin Screens

Admin-only:

- Admin dashboard
- Departments
- Users
- Analytics

Minimum first version:

- Show counts
- Department list
- User list
- Activate/deactivate users

## UI Style

Use minimal design:

- White background
- Slate/gray text
- Blue as primary accent
- Border-based cards
- 8px border radius
- No heavy gradients
- No large marketing hero sections
- Keep pages functional and direct

Suggested colors:

```js
const colors = {
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  primary: '#1d4ed8',
  primaryDark: '#1e40af',
  danger: '#dc2626',
  success: '#059669',
  warning: '#d97706'
};
```

## Recommended Folder Structure

```txt
src/
  App.js
  context/
    AuthContext.js
    LanguageContext.js
  services/
    api.js
    storage.js
  components/
    AppHeader.js
    Button.js
    Input.js
    Panel.js
    ComplaintList.js
    StatusBadge.js
  screens/
    LoginScreen.js
    RegisterScreen.js
    DashboardScreen.js
    ComplaintsScreen.js
    NewComplaintScreen.js
    ComplaintDetailsScreen.js
    CommunityScreen.js
    ProfileScreen.js
    AdminDashboardScreen.js
    DepartmentsScreen.js
    UsersScreen.js
    AnalyticsScreen.js
```

## API Service Example

```js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

## Important Functional Requirements

- App must stay logged in after refresh.
- Logout must clear token.
- Citizen cannot access admin screens.
- Admin cannot submit new complaints if citizen-only route is enforced.
- Community complaint detail should not show 403 for non-rejected complaints.
- Register must not send Aadhaar.
- Public registration must always send role `citizen`.
- Login must send selected role.
- All forms should show validation errors before API call.
- API errors should show the backend message when available.

## Copy Assets

Copy this file into the new app:

```txt
frontend/public/janVoice.webp
```

Suggested location in new repo:

```txt
assets/janVoice.webp
```

Use it in header:

```jsx
<Image source={require('../assets/janVoice.webp')} />
```

## First Build Target

First implement these screens:

1. Login
2. Register
3. Dashboard
4. Complaints
5. Complaint Details
6. Community
7. New Complaint

Then add admin screens.

## Testing Checklist

- Register citizen
- Login citizen
- Login admin
- Token persists after refresh
- Submit complaint
- View own complaint detail
- View community complaint detail
- Like community complaint
- Comment on complaint
- Filter complaints
- Update profile
- Admin opens admin dashboard
- Admin manages users/departments

