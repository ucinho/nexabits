import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Home from './pages/Home';
import Crypto from './pages/Crypto';
import Trending from './pages/Trending';
import Saved from './pages/Saved';
import CryptoDetails from './components/CryptoDetails';

import Boost from './carrotPages/Boost'
import NewsFeed from './carrotPages/NewsFeed'
import Referrals from './carrotPages/Referrals'
import Task from './carrotPages/Task'
import Tap from './carrotPages/Tap'
import NewsFeedDetails from './carrotPages/NewsFeedDetails';


const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children:[
      {
        path:"/",
        element: <Tap />,
        children: [
          {
            path:":coinId",
            element: <CryptoDetails />
          }
        ]
      },
      {
        path:"/task",
        element: <Task />,
        children: [
          {
            path:":coinId",
            element: <CryptoDetails />
          }
        ]
      },
      {
        path:"/ref",
        element: <Referrals />,
        children: [
          {
            path:":coinId",
            element: <CryptoDetails />
          }
        ]
      },
      {
        path:"/boost",
        element: <Boost />,
        children: [
          {
            path:":coinId",
            element: <CryptoDetails />
          }
        ]
      },
      {
        path:"/news",
        element: <NewsFeed />,
        children: [
          {
            path:`/news/id`,
            element: <NewsFeedDetails />
          }
        ]
      },
      {
        path:`/news/:id`,
        element: <NewsFeedDetails />,
        children: [
          {
            path:":coinId",
            element: <CryptoDetails />
          }
        ]
      },
      {
        path:"/trending",
        element: <Trending />,
        children: [
          {
            path:":coinId",
            element: <CryptoDetails />
          }
        ]
      }
    ]


  },
]);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();