import React, { Component } from 'react'
import styled from 'styled-components'
import {vhToPx} from '@/utils'
import ActivityIndicator from "@/Components/Common/ActivityIndicator";

export default class ActivityComponent extends Component {
  render() {
    return (
      <Container backgroundColor={this.props.backgroundColor}>
        {/*<PACircle size={5}/>*/}
        <WaitMessageWrap>
          <ActivityIndicator height={5} color={'#ffffff'} />
          <Message>page loading. please wait...</Message>
        </WaitMessageWrap>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.backgroundColor || '#222222'};
`

const WaitMessageWrap = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const Message = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(2.5)};
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.1)};
  height: ${props => vhToPx(2.5 * 0.75)};
  line-height: 1;
`
