import React, { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { intercept, extendObservable } from 'mobx'
import styled from 'styled-components'
import ErrorComponent from '@/Components/Common/ErrorComponent'

@inject('NavigationStore', 'OperatorStore', 'CommonStore')
@observer
export default class Main extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      errorComp: null,
    })

    this.destroyErrorResponse = intercept(
      this.props.CommonStore,
      'errorResponse',
      change => {
        if (change.newValue) {
          switch (change.newValue.toLowerCase()) {
            case 'unauthorized':
              //this.errorComp = <ErrorComponent status="unauthorized" msg="the token is expired. please re-login." />
              this.errorComp = (
                <ErrorComponent
                  status="unauthorized"
                  msg="unauthorized: access is denied due to invalid credentials."
                />
              )
              break
            default:
              this.errorComp = <ErrorComponent />
              break
          }
        } else {
          this.errorComp = null
        }
        return change
      }
    )

    this.props.OperatorStore.checkLoggedIn()
  }

  componentWillUnmount() {
    this.destroyErrorResponse()
  }

  render() {
    const View = this.props.NavigationStore.currentView

    return (
      <MainFrame>
        {this.errorComp}
        <ContentWrapper>
          <View />
        </ContentWrapper>
      </MainFrame>
    )
  }
}

const MainFrame = styled.div`
  // width: 100vw;
  // height: 100vh;
  // display: flex;

  width: 100%;
  height: 100%;
  display: flex;
`

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  // position: absolute;
  display: flex;
  flex-direction: column;
`
