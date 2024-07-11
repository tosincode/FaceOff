/**
 * @format
 */

import {AppRegistry, View} from 'react-native';

import App from './App';
import {name as appName} from './app.json';
import AsyncStorage from "@react-native-community/async-storage";
import messaging from '@react-native-firebase/messaging'
import moment from "moment";
import {ApolloClient} from 'apollo-client';
import {createHttpLink} from 'apollo-link-http';
import {setContext} from 'apollo-link-context';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {onError} from 'apollo-link-error';
import {ApolloProvider} from '@apollo/react-hooks';



// const httpLink = createHttpLink({
//     uri: `http://3.130.98.232/graphql`
//   });

// const httpLink = createHttpLink({
//     uri: `http://54.164.212.93:3002/graphql`
//   });

const httpLink = createHttpLink({
    uri: `https://faceoff24.com/graphql`
  });


 
 // https://faceoff24.com/graphql

  let tokenExpiry = null;
let refreshTokenExpiry = null;
let refreshToken = null;
let token = null;


const authLink = setContext(async (_, {headers}) => {
    // if (token === null) {
    //   token = await AsyncStorage.getItem('Accesstoken');
    // }

    token = await AsyncStorage.getItem('Accesstoken');

    console.log("Accesstoken Index", token)
    return {
      headers: {
        ...headers,
        "Authorization": `Bearer ${token}`
      }
    }
  });
  const errorLink = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors && graphQLErrors.length > 0 && graphQLErrors[0].message === 'UNAUTHORIZED') {
    } else if (graphQLErrors && graphQLErrors.error && graphQLErrors.error.networkError && graphQLErrors.error.networkError["otherToken"]) {
    }
  });

  const refreshTokenLink = setContext((_) => {
    return new Promise(async (resolve, reject) => {
      const format = 'YYYY-M-DD HH:mm:ss Z';
      let expiry;
      if (tokenExpiry === null) {
        tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
      }
      expiry = moment(tokenExpiry, format);
      let now = moment();
      if (now.isAfter(expiry)) {
        if (refreshToken === null) {
          refreshToken = await AsyncStorage.getItem('refreshToken');
        }
        if (refreshTokenExpiry === null) {
          refreshTokenExpiry = await AsyncStorage.getItem('refreshTokenExpiry');
        }
        let refreshExpiry = moment(refreshTokenExpiry, format);
        if (refreshExpiry.isAfter(now)) {
          let tokens = await refreshTokenFromServer(refreshToken).catch(error => {
            reject({otherToken: true});
          });
          if (tokens && tokens.accessToken) {
            tokenExpiry = tokens.accessTokenExpiry;
            refreshToken = tokens.refreshToken;
            refreshTokenExpiry = tokens.refreshTokenExpiry;
            token = tokens.accessToken;
            resolve();
            AsyncStorage.multiSet([
              ['token', tokens.accessToken],
              ['tokenExpiry', tokens.accessTokenExpiry],
              ['refreshToken', tokens.refreshToken],
              ['refreshTokenExpiry', tokens.refreshTokenExpiry],
            ]);
          } else {
            reject({otherToken: true});
          }
        } else {
          reject([{message: 'UNAUTHORIZED'}]);
          AsyncStorage.clear().then(() => RNRestart.Restart());
        }
      } else {
        resolve();
      }
    });
  });

  const refreshTokenFromServer = async refreshToken => {
    // console.log("innn")
    AsyncStorage.clear().then(() => RNRestart.Restart());
    // return new Promise((resolve, reject) => {
    //   fetch(`${url}/jwt/refresh`, {
    //     method: 'POST',
    //     headers: {
    //       'X-Refresh-Token': refreshToken,
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json'
    //     }
    //   })
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error('There was some error');
    //       }
    //       return response.json();
    //     })
    //     .then(response => {
    //       resolve(response);
    //     })
    //     .catch(error => reject(error));
    // });
  };
  const client = new ApolloClient({
    link: refreshTokenLink.concat(authLink).concat(errorLink).concat(httpLink),
    cache: new InMemoryCache()
  });

  const Base = () => (    
	<ApolloProvider client={client}>
      
          <App/>
     
  </ApolloProvider>
);


AppRegistry.registerComponent(appName, () => Base);

//AppRegistry.registerComponent(appName, () => App);
