# Getting Started with Create React App

This sample demonstrates the integration of the Microsoft Graph Toolkit into a fully functional React application using [Create React App](https://github.com/facebook/create-react-app).

The sample uses the library [@microsoft/mgt-react](https://www.npmjs.com/package/@microsoft/mgt-react) to simplify usage of [Microsoft Graph Toolkit (mgt)](https://aka.ms/mgt) web components in React. The library wraps all mgt components and exports them as React components.

## Prerequisites
1. Microsoft 365 Developer Account
2. Node.js and yarn installed
3. Register your APP and get your own Application (Client ID). For more details, Please refer to this page: https://learn.microsoft.com/en-us/azure/healthcare-apis/register-application
## Setting up this sample

1. Clone this demo samples from github repo
2. run `cd samples/app/react-contoso` to demo app folder
3. Copy the `.env.sample` to its own `.env` file
4. Add your own Application (Client ID) in the file for `REACT_APP_CLIENT_ID`
5. Install the dependencies with `yarn`

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
