# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
----------------------------------------------------------------------------------------------------------------------------------------------------
## HOW TO USE THE APP 
# Vehicle Management System

A React Native application for managing vehicle data with custom attributes. This application provides a user-friendly interface to add, edit, delete, and view vehicle information.

## Features

- 📱 Built with React Native
- 🚗 CRUD operations for vehicle management
- ✨ Custom attributes support for each vehicle
- 🔒 Protected routes for secure access
- 📊 Real-time data updates
- 🎨 Clean and intuitive user interface

## Technologies Used

- React Native
- Redux (for state management)
- React Navigation
- Expo
- React Native Elements

## Installation

1. Clone the repository,
```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```
   
2. Install dependencies:
one by one run :
   ```bash
   npm install
   npm install react-native-ble-manager
   npm install @reduxjs/toolkit react-redux
   ```

3. Install Expo CLI
   on the projects bash run :
   ```bash
   npm install -g expo-cli
   ```

4. Running on an Android Device
   a. Install Expo Go on Your Android Device
   Download the Expo Go app on your Android device:
   Google Play Store - Expo Go
   b. Enable Developer Mode
   Enable Developer Mode on your Android device:
   Go to Settings > About Phone > Software Information.
   Tap on Build Number 7 times.
   Developer options will now be enabled.
   Enable USB Debugging:
   Go to Settings > Developer Options.
   Turn on USB Debugging.
   c. Connect Your Phone to Your Computer
   Connect your phone to your computer via USB and allow File Access when prompted.

5. Generate an APK
   a. Install Expo Build Tools
   On bash:
   ```bash
   npm install -g eas-cli
   ```

   b. Log in to Your Expo Account
   on bash:
   ```bash
   eas login
   ```

   c. Configure the Build
   on bash:
   ```bash
   eas build:configure
   ```

   d. Build the APK
   on bash:
   ```bash
   eas build --profile development --platform android
   ```
Once the build process is complete, the APK file will be available for download. You can install this file on your Android device.
   
  6. Run the Project
   Again on the bash:
```bash
   npx expo start -c
```

   - Scan QR code with Expo Go app
   - Press 'a' in terminal for Android device
   make sure you are using development build, if you are on Expo go to swtich development build , click on 's' first then 'a' .





   






