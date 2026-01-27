# Hajj Guide - React Native Expo App

## Project Overview

Hajj Guide is a React Native mobile application built with Expo that provides guidance and information about the Hajj pilgrimage. The app runs on the latest Expo Go and supports iOS, Android, and web platforms.

## Project Setup Complete

- ✅ Expo project initialized with latest version
- ✅ TypeScript support enabled
- ✅ Expo Router configured for navigation
- ✅ Dependencies installed

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Build Tool**: Expo CLI
- **Package Manager**: npm

## Project Structure

```
hajj_guide/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── _layout.tsx        # Root layout configuration
│   └── modal.tsx          # Modal screen
├── assets/                # Images and static assets
├── components/            # Reusable React components
├── constants/             # App constants
├── hooks/                 # Custom React hooks
├── app.json               # Expo configuration
└── package.json           # Project dependencies
```

## Available Commands

- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm start` - Start Expo development server

## Development Guidelines

- Use TypeScript for all new components and files
- Follow the existing folder structure
- Use Expo Router for navigation management
- Test on Expo Go for quick iteration

## Next Steps

1. Install Expo Go on your mobile device (iOS/Android)
2. Run `npm start` in the terminal
3. Scan the QR code with your phone to preview the app
4. Begin adding Hajj-specific features and screens
