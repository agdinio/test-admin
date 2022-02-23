import React, { Component, forwardRef } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { vhToPx, vwToPx, evalImage } from '@/utils'
import DatePicker from 'react-datepicker'
import dateFormat from 'dateformat'
let h = 0

@inject('GameEventStore')
@observer
export default class EditingDateStart extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      timeStart: this.props.GameEventStore.values.timeStart,
      dateStart: this.props.GameEventStore.values.dateStart,
      dateType: 'dateStart',
    })
    h = this.props.GameEventStore.baseHeight
  }

  handleStartDateChange(d) {
    this.dateStart = d
  }

  handleStartTimeChange(e) {
    this.timeStart = e.target.value
  }

  handleContinue() {
    this.props.GameEventStore.values.timeStart = this.timeStart
    this.props.GameEventStore.values.dateStart = dateFormat(
      this.dateStart,
      'yyyy-mm-dd'
    )
    this.props.close()
  }

  render() {
    const ref = React.createRef()
    const CustomStartDateInput = forwardRef(({ value, onClick }, _ref) => (
      <DatePickerInput
        src={evalImage(`icon-calendar.svg`)}
        onClick={onClick}
        ref={_ref}
      >
        <FormattedDateWrap>
          <Label font={'pamainbold'} size={2.9} color={'#000000'} nospacing>
            {dateFormat(value, 'mmm.')}&nbsp;
          </Label>
          <Label font={'pamainlight'} size={4} color={'#000000'} nospacing>
            {dateFormat(value, 'dd')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={2.9} color={'#000000'} nospacing>
            {dateFormat(value, 'dddd,')}&nbsp;
          </Label>
          <Label font={'pamainbold'} size={2.9} color={'#000000'} nospacing>
            {dateFormat(value, 'yyyy')}
          </Label>
        </FormattedDateWrap>
      </DatePickerInput>
    ))

    return (
      <Container>
        <Section
          key="editing-section-1"
          direction="column"
          alignItems="center"
          marginTop="20"
        >
          <div key="editing-div-1" style={{ width: '90%' }}>
            <DatePickerWrap>
              <DatePicker
                selected={new Date(this.dateStart)}
                customInput={<CustomStartDateInput ref={ref} />}
                onChange={this.handleStartDateChange.bind(this)}
              />
            </DatePickerWrap>
          </div>
          <div key="editing-div-2" style={{ width: '90%' }}>
            <DDStartTimeEditing
              value={this.timeStart}
              onChange={this.handleStartTimeChange.bind(this)}
            >
              {this.props.GameEventStore.startTimes.map((time, idx) => (
                <option key={`${idx}-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </DDStartTimeEditing>
          </div>
        </Section>
        <Section key="editing-section-2" justifyContent="center" marginTop="2">
          <div
            key="editing-div-3"
            style={{
              width: '90%',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <ModalButton
              key="modalbutton-dateStart-cancel"
              text="cancel"
              color={'#ffffff'}
              hasBorder
              marginRight
              onClick={this.props.close}
            />
            <ModalButton
              key="modalbutton-dateStart-continue"
              text="continue"
              color={'#ffffff'}
              backgroundColor={'#18c5ff'}
              onClick={this.handleContinue.bind(this)}
            />
          </div>
        </Section>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`

const Section = styled.div`
  width: 100%;
  margin-top: ${props => vhToPx(props.marginTop || 0)};
  margin-bottom: ${props => vhToPx(props.marginBottom || 0)};
  display: flex;
  ${props => (props.direction ? `flex-direction:${props.direction}` : ``)};
  ${props =>
    props.justifyContent ? `justify-content:${props.justifyContent};` : ``};
  ${props => (props.alignItems ? `align-items:${props.alignItems};` : ``)};
`

const Label = styled.span`
  height: ${props => vhToPx(props.size * 0.8 || 3)};
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx(props.size || 3)};
  color: ${props => props.color || '#000000'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => vhToPx(props.nospacing ? 0 : 0.1)};
`

const DatePickerWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(h + 2)};
  background-color: #ffffff;
`

const DatePickerInput = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  &:after {
    position: absolute;
    width: ${props => vhToPx(h)};
    height: ${props => vhToPx(h)};
    content: '';
    display: inline-block;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    ${props =>
      props.srcRotate ? `transform: rotate(${props.srcRotate}deg);` : ''};
    left: 86%;
  }
`

const FormattedDateWrap = styled.div`
  display: flex;
  align-items: flex-end;
`

const DDStartTimeEditing = styled.select`
  margin-top: ${props => vhToPx(1)};
  width: 100%;
  height: ${props => vhToPx(h + 2)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  //margin-right: ${props => vhToPx(0.2)};
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.8)};
  line-height: 0.9;
  text-indent: ${props => vwToPx(0.5)};
  text-transform: uppercase;
  background-image: url(${evalImage(`icon-time.svg`)});
  background-repeat: no-repeat;
  background-size: 11%;
  background-position: 96%;
`

const ModalButton = styled.div`
  width: 25%;
  height: ${props => vhToPx(5)};
  ${props =>
    props.backgroundColor ? `background-color:${props.backgroundColor}` : ``};
  ${props =>
    props.hasBorder ? `border:${vhToPx(0.4)} solid ${props.color}` : ``};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  ${props => (props.marginRight ? `margin-right:${vwToPx(0.5)}` : ``)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.5)};
    color: ${props => props.color};
    text-transform: uppercase;
    line-height: 1;
  }
`
