import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import * as util from '@/utils'

@observer
export default class QuestionChoicesPanel extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    extendObservable(this, {})
  }

  render() {
    let { currentPrePick, question } = this.props
    return (
      <Container>
        <Top>
          <TopLeft>
            <CurrentPrePickNum>{currentPrePick}</CurrentPrePickNum>
          </TopLeft>
          <QuestionHeader>{question && question.questionHeader || ''}</QuestionHeader>
        </Top>

        {/*<Bottom>*/}
        {/*  {question.labels.map((item, key) => {*/}
        {/*    return (*/}
        {/*      <QuestionItem color={item.color} key={key}>*/}
        {/*        {item.value === '?' ? item.value : ` ${item.value}`}*/}
        {/*      </QuestionItem>*/}
        {/*    )*/}
        {/*  })}*/}
        {/*</Bottom>*/}

        <Bottom>
          <QuestionItem>{question && question.questionDetail || ''}</QuestionItem>
        </Bottom>
      </Container>
    )
  }
}

let h = 0

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Top = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
`
const TopLeft = styled.div`
  display: flex;
  align-items: center;
  margin-top: ${props => util.vhToPx(h * 0.005)};
`

const CurrentPrePickNum = styled.div`
  background-color: #2fc12f;
  width: ${props => util.vhToPx(h * 0.034)};
  height: ${props => util.vhToPx(h * 0.034)};
  border-radius: 50%;
  font-family: pamainextrabold;
  font-size: ${props => util.vhToPx(h * 0.025)};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 3%;
  margin-right: ${props => util.vhToPx(h * 0.005)};
`

const CurrentPrePickNumWrapper = styled.div`
  width: ${util.vhToPx(3.3)};
  height: ${util.vhToPx(3.3)};
  border-radius: 50%;
  background-color: #2fc12f;
  margin-right: ${props => util.vhToPx(h * 0.05)};
  position: relative;
`
const CurrentPrePickNum_ = styled.div`
  font-family: pamainextrabold;
  font-size: ${util.vhToPx(2.4)};
  color: #ffffff;
  padding-bottom: ${props => util.vhToPx(0.02)};
  margin-top: ${util.vhToPx(0.2)};

  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
`
const QuestionHeader = styled.div`
  font-family: pamainlight;
  font-size: ${props => util.vhToPx(h * 0.076)};
  color: #ffffff;
  text-transform: uppercase;
  display: inline-block;
  height: ${props => util.vhToPx(h * 0.057)};
  line-height: ${props => util.vhToPx(h * 0.06)};
`
const Bottom = styled.div`
  width: 74%;
  display: flex;
  justify-content: center;
  font-family: pamainregular;
  font-size: ${props => util.vhToPx(h * 0.041)};
  line-height: ${props => util.vhToPx(h * 0.041)};
  padding-top: ${props => util.vhToPx(h * 0.01)};
`
const QuestionItem = styled.span`
  text-transform: uppercase;
  color: #2fc12f;
  text-align: center;
`
