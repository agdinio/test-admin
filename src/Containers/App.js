import React, { PureComponent } from 'react'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import styled from 'styled-components'
import { vhToPx, vwToPx, maxHeight } from '@/utils'
import { inject } from 'mobx-react'
//import Main from '@/Components/Main'
import Loadable from 'react-loadable'
import ActivityComponent from "@/Components/Common/ActivityComponent";

const Main = Loadable({
  loader: () => import('@/Components/Main'),
  loading: ActivityComponent
})

class App extends PureComponent {
  render() {
    return (
      <AppContainer>
        <Switch>
          <Route exact path="/" component={Main}/>
          <Redirect to="/"/>
        </Switch>
      </AppContainer>
    )
  }
}

export default App

const AppContainer = styled.div`
/*
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  min-width: ${props => vwToPx(100)};
  min-height: ${props => vhToPx(100)};
*/

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  user-select: none;
`
