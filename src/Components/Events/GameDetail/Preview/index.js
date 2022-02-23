import React, { Component } from 'react'
import styled, { keyframes } from 'styled-components'
import bgDefault from '@/assets/images/playalong-default.jpg'
import iconMenu from '@/assets/images/preview/icon-menu.svg'
import iconMenuPlayalong from '@/assets/images/preview/PlayAlongNow-Logo_Invert.svg'
import {vhToPx, vhToPxNum} from '@/utils'
import CountdownClock from '@/Components/Events/GameDetail/Preview/CountdownClock'
import ABSlider from './Slider/ABSlider'
import MultiSelectSlider from './Slider/MultiSelectSlider'
import QuestionChoicesPanel from './QuestionChoicesPanel'
import HistoryTracker from './HistoryTracker'
import PicksPointsTokens from './PicksPointsTokens'
import iconArrow from '@/assets/images/icon-arrow.svg'
import Draggable, {DraggableCore} from 'react-draggable';

const TEAMS = [
    {"gameId":"","id":1,"name":"chiefs","initial":"c","score":0,"topColor":"#000000","bottomColor":"#414042","showTopColorPicker":false,"showBottomColorPicker":false},
    {"gameId":"","id":2,"name":"giants","initial":"g","score":0,"topColor":"#000000","bottomColor":"#414042","showTopColorPicker":false,"showBottomColorPicker":false}
  ]
const MOCK = {
  "sequence":1,
  "question":"",
  "questionHeader":"who",
  "questionDetail":"wins the coin toss?",
  "choiceType":"ab",
  "choices":[
    {"gameId":"","id":1,"name":"a","initial":"a","score":0,"topColor":"#000000","bottomColor":"#414042","showTopColorPicker":false,"showBottomColorPicker":false},
    {"gameId":"","id":2,"name":"b","initial":"b","score":0,"topColor":"#000000","bottomColor":"#414042","showTopColorPicker":false,"showBottomColorPicker":false}],
  "forParticipant":{},
  "shortHand":"",
  "sponsor":{},
  "info":{"value":'<p><span class="ql-font-pamainbold" style="color: rgb(0, 0, 0);">PICK and WIN\n </span><span class="ql-font-pamainbold" style="color: rgb(15, 188, 28);">5 PRE-PICKS\n</span><span class="ql-font-pamainbold" style="color: rgb(0, 0, 0);"> Use YOUR </span><span class="ql-font-pamainbold" style="color: rgb(23, 196, 254);">points</span><span class="ql-font-pamainbold" style="color: rgb(0, 0, 0);"> &amp; </span><span class="ql-font-pamainbold" style="color: rgb(255, 182, 0);">tokens\n</span><span class="ql-font-pamainbold" style="color: rgb(0, 0, 0);"> For </span><span class="ql-font-pamainbold" style="color: rgb(198, 24, 24);">LIVE</span><span class="ql-font-pamainbold" style="color: rgb(0, 0, 0);"> Play</span></p>',"font":"pamainbold","color":"#000000"}
}

export default class Preview extends Component {

  render() {
//const question = MOCK
    let { values, question, size } = this.props
    let SliderTag = question
      ? question.choiceType.toLowerCase() === 'ab'
        ? ABSlider
        : MultiSelectSlider
      : ABSlider

    const infoValues = question && question.info ? question.info.value
      .replace(/rgb\(0, 0, 0\)/g, 'rgb(255, 255, 255)')
      .replace(/rgb\(1, 1, 1\)/g, 'rgb(255, 255, 255)') : []

    const x = (size.left - vhToPxNum(w + 1.8));
    const y = values.prePicks.length >=10 ? 0 : (size.top - vhToPxNum(h + 1.7));

    return (
      <PreviewContainer grab={true} key={`key-${y}`}>
        <Draggable
          positionOffset={{x: '100%', y: 0}}
          defaultPosition={{x: x, y: y}}
          handle=".handle"
          grid={[5, 5]}
          scale={1}
          bounds="body"
        >
          <Container className="handle">
            <MenuWrapper>
              <TopNavContentSideBySide>
                <TopNavContentLeft></TopNavContentLeft>
                <TopNavContentRight>
                  <IconMenuWrapper>
                    <IconMenu src={iconMenu} />
                  </IconMenuWrapper>
                </TopNavContentRight>
              </TopNavContentSideBySide>
              <TopNavContentMiddle>
                <IconMenuPlayalong src={iconMenuPlayalong} />
              </TopNavContentMiddle>
            </MenuWrapper>
            <Wrapper>

              <Section marginTop={h * 0.04} justifyContent="center">
                <CountdownClock timeStart={new Date('1980-01-01 ' + values.timeStart)} height={h} />
              </Section>

              <Section marginTop={h * 0.04}>
                <QuestionChoicesPanel
                  currentPrePick={question && question.sequence || ''}
                  question={question}
                  height={h}
                />
              </Section>

              <Section marginTop={h * 0.03} style={{paddingLeft:'4.5%', paddingRight:'4.5%'}}>
                <SliderTag
                  key={`slider-${question && question.sequence ? question.sequence : 0}`}
                  currentPrePick={question && question.sequence ? question.sequence : 0}
                  teams={values && values.participants ? values.participants : []}
                  //--teams={TEAMS}
                  question={question}
                  groupComponent={'PREPICK'}
                  height={h}
                />
              </Section>

              <Section marginTop={h * 0.06} justifyContent={'center'}>
                <ArrowUp src={iconArrow} />
              </Section>

              <Section marginTop={h * 0.001} justifyContent={'center'}>
                {
                  question && question.sequence && question.sequence === 1 ? (
                    <InfoHeader />
                  ) : null
                }
              </Section>

              <Section marginTop={h * 0.023} justifyContent={'center'}>
                <InfoWrapper>
                  <Info dangerouslySetInnerHTML={{ __html: infoValues }} />
                </InfoWrapper>
              </Section>

              <Section style={{width:'100%', position:'absolute', bottom:0, marginBottom:vhToPx(h * 0.16)}}>
                <HistoryTracker
                  preText="Pre Pick"
                  symbol="PrePick"
                  currentPrePick={question && question.sequence ? question.sequence : 0}
                  height={h}
                />
              </Section>

              <Section style={{width:'100%', position:'absolute', bottom:0, marginBottom:vhToPx(1), paddingRight:'4.5%'}}>
                <PicksPointsTokens
                  question={question}
                  totalPrePicks={values && values.prePicks ? values.prePicks.length : 0}
                  currentPrePick={question && question.sequence ? question.sequence : 0}
                  height={h}
                />
              </Section>

            </Wrapper>
          </Container>
        </Draggable>
      </PreviewContainer>
    )
  }

}


const h = 50;
const w = h * 0.65;

const PreviewContainer = styled.div`
  position: absolute;
  width: ${props => vhToPx(w)};
  height: ${props => vhToPx(h)};
  z-index: 202;
  left: ${props => vhToPx(-w)};
  top: 0;
  &:hover {
    cursor: ${props => (props.grab ? '-moz-grab' : '')};
    cursor: ${props => (props.grab ? '-webkit-grab' : '')};
    cursor: ${props => (props.grab ? 'grab' : '')};
  }
  &:active {
    cursor: ${props => (props.grab ? '-moz-grabbing' : '')};
    cursor: ${props => (props.grab ? '-webkit-grabbing' : '')};
    cursor: ${props => (props.grab ? 'grabbing' : '')};
  }
`

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-image: url(${bgDefault});
  background-repeat: no-repeat;
  background-size: cover;
`

const MenuWrapper = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 0.068)};
  background-color: #000000;
  display: flex;
  position: relative;
`

const TopNavContentSideBySide = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  display: flex;
  width: 100%;
  height: 100%;
`

const TopNavContentLeft = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
`

const TopNavContentRight = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`

const IconMenuWrapper = styled.div`
  right: 0;
  width: ${props => vhToPx(h * (5.5/100))};
  height: ${props => vhToPx(h * (5.5/100))};
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 2%;
`

const IconMenu = styled.img`
  width: ${props => vhToPx(h * (2.7/100))};
  pointer-events: none;
`

const TopNavContentMiddle = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`

const IconMenuPlayalong = styled.img`
  z-index: 1;
  height: ${props => vhToPx(h * (4.5/100))};
`

const Section = styled.div`
  width: 100%;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  ${props => props.direction ? `flex-direction:${props.direction}` : ``};
  ${props => props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => props.alignItems ? `align-items:${props.alignItems};` : ``};
`

const ArrowUp = styled.img`
  transform: rotate(-90deg);
  width: ${props => vhToPx(h * 0.028)};
`

const InfoWrapper = styled.div`
  width: 70%;
  display: flex;
  flex-direction: column;
`

const Info = styled.div`
  text-align: center;
  font-size: ${props => vhToPx(h * 0.037)};
  line-height: 0.5;
`

const InfoHeader = styled.div`
  display: flex;
  flex-direction: row;
  &:before {
    content: 'begin';
    font-family: pamainlight;
    font-size: ${props => vhToPx(h * 0.075)};
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx((h * 0.075) * 0.8)};
    text-transform: uppercase;
    margin-right: ${props => vhToPx(h * 0.017)}
  }
  &:after {
    content: 'pre-picks';
    font-family: pamainlight;
    font-size: ${props => vhToPx(h * 0.075)};
    color: #0fbc1c;
    line-height: 1;
    height: ${props => vhToPx((h * 0.075) * 0.8)};
    text-transform: uppercase;
  }
`
