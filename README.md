# Gazonne

## Run the app

* Install dependencies (Requires a LTS version of Node.js)

   ```bash
   npm install
   ```

* Prebuild

   ```bash
   npx expo prebuild --clean
   ```

* Start the app on IOS

   ```bash
   npx expo run:ios
   ```

* Start the app on Android (Requires Java 17)

   ```bash
   npx expo run:android
   ```

Note: It is not possible to launch the app using the command below because of the use of Firebase.

   ```bash
   npx expo start
   ```