// import React from 'react'
import { Redirect } from 'react-router-dom';
import { renderRoutes } from 'react-router-config'
import './app.module.less'
// import { useDispatch } from 'react-redux'

// import api from '../api'
// 可以在这里做登录拦截或者其他

const App = (props) => {
  const { route } = props

  const { pathname } = props.location

  // if (!isLogin) {
  //   return (
  //     <Redirect
  //       to={{
  //         pathname: '/login',
  //         state: {
  //           from: props.location.pathname,
  //           ...props.location.state
  //         },
  //       }}
  //     />
  //   )
  // }
  // 避免路由匹配不上，过滤白屏
  const canNotMatch = [
    '/app',
  ]

  if (canNotMatch.includes(pathname)) {
    return <Redirect to='/404' />
  }

  return (
    <div styleName='app' style={{ width: '100%', height: '100%' }}>

      {renderRoutes(route.routes)}
    </div>
  )
}
export default App
