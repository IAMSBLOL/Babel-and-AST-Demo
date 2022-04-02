
// import React from 'react'

import loadable from '@loadable/component'
import { Redirect } from 'react-router-dom'
import {
  APP_HOME, APP_TEST
} from './pathNames'

const routes = [
  {
    exact: true,
    path: '/',
    component: () => <Redirect to={APP_HOME} />,
  },
  {
    path: '/app',
    // exact: true,
    strict: true,
    component: loadable(() => import('@src/views/container/app')),
    routes: [
      {
        path: APP_TEST,
        component: loadable(() => import('../views/test')),
      },
      {
        path: APP_HOME,
        component: loadable(() => import('../views/home')),
      },
    ]
  }
]

export default routes;
