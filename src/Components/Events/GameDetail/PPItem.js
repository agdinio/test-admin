import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept } from 'mobx'
import { vhToPx, vwToPx, isEqual, evalImage } from '@/utils'
import LockIcon from '@/assets/images/icon-lock.svg'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'
import TypeIcon from '@/assets/images/icon-type.svg'
import XIcon from '@/assets/images/icon-x.svg'
import TeamIcon from '@/Components/Common/TeamIcon'
import DnDIcon from '@/assets/images/icon-dnd.png'
import DDTeam from '@/Components/Events/GameDetail/DDTeam'
import { TimelineMax } from 'gsap'
import TextEditor from '@/Components/Common/TextEditor'
import DDSponsorBrand from '@/Components/Common/DDSponsorBrand'
import { Draggable } from 'react-beautiful-dnd'

@inject('GameEventStore')
@observer
export default class PPItem extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      numberOfChoicesComponent: null,
      quill: { sponsorFont: 'pamainbold', sponsorColor: '#000000' },
    })

    text_editor_height = this.props.height * 3
    h = this.props.height
    this.numOfChoice = 0

    this.destroyTeamUpdated = intercept(
      this.props.GameEventStore,
      'teamUpdated',
      change => {
        if (change.newValue) {
          this.forceUpdate()
        }
        return change
      }
    )

    //this.defaultValues = JSON.parse(JSON.stringify(this.props.GameEventStore.values))
  }

  handleNumberOfChoicesChange(e) {
    if (!isNaN(e.target.value)) {
      if (this[`numberchoices-${this.props.item.sequence}`]) {
        if (e.target.value.indexOf('.') < 0) {
          this[`numberchoices-${this.props.item.sequence}`].value =
            e.target.value
          this.numOfChoice = e.target.value
        } else {
          this[
            `numberchoices-${this.props.item.sequence}`
          ].value = e.target.value.slice(0, -1)
          this.numOfChoice = e.target.value.slice(0, -1)
        }
      }
    } else {
      this[
        `numberchoices-${this.props.item.sequence}`
      ].value = e.target.value.slice(0, -1)
      this.numOfChoice = e.target.value.slice(0, -1)
    }
  }

  handleNOCCancelClick() {
    this.numberOfChoicesComponent = null
    this.props.item.choiceType = 'ab'
    this.numOfChoice = 0
    this.forceUpdate()
  }

  handleNOCOKClick() {
    if (isNaN(this.numOfChoice) || this.numOfChoice < 2) {
      if (this[`numberchoices-${this.props.item.sequence}`]) {
        this[
          `numberchoices-${this.props.item.sequence}`
        ].style.border = `${vhToPx(0.1)} solid #ff0000`
        return
      }
    }

    this.props.item.choices = []
    this.props.item.forParticipant = this.props.GameEventStore.values.participants[0]

    for (let i = 0; i < this.numOfChoice; i++) {
      let choice = { id: i + 1, value: '' }
      this.props.item.choices.push(choice)
    }

    this.numberOfChoicesComponent = null
    this.props.item.choiceType = 'multi'

    this.forceUpdate()
  }

  handleChoiceTypeChange(e) {
    this.toggleSponsor(true)

    this.props.item.choiceType = e.target.value
    if (e.target.value === 'ab') {
      this.renderABTeamsChoices()
      return
    }

    this.numberOfChoicesComponent = (
      <NumberOfChoicesPopup>
        <Label
          key={`numchoice-label-${this.props.item.sequence}`}
          font={'pamainbold'}
          size={h * 0.4}
          color={'#000000'}
          uppercase
          nowrap
        >
          enter number of choices:&nbsp;
        </Label>
        <TextBox
          key={`numchoice-input-${this.props.item.sequence}`}
          type="text"
          widthInPct={10}
          style={{ height: '80%', textAlign: 'center' }}
          innerRef={ref =>
            (this[`numberchoices-${this.props.item.sequence}`] = ref)
          }
          onChange={this.handleNumberOfChoicesChange.bind(this)}
        />
        <NumberOfChoicesButton
          key={`cancel-button-${this.props.item.sequence}`}
          text={'cancel'}
          onClick={this.handleNOCCancelClick.bind(this)}
        />
        <NumberOfChoicesButton
          key={`ok-button-${this.props.item.sequence}`}
          text={'ok'}
          onClick={this.handleNOCOKClick.bind(this)}
        />
      </NumberOfChoicesPopup>
    )

    this.forceUpdate()
  }

  handleInputFocus() {
    if (this.props.refPrePickItemFocus) {
      this.props.refPrePickItemFocus(this.props.item)
    }
  }

  handleQuestionHeaderChange(e) {
    this.props.item.questionHeader = e.target.value
    this.forceUpdate()
  }

  handleQuestionDetailChange(e) {
    this.props.item.questionDetail = e.target.value
    this.forceUpdate()
  }

  handleSelectedTeam(response) {
    this.props.item.forParticipant = response
    this.forceUpdate()
  }

  handleQuestionChoiceChange(idx, e) {
    this.props.item.choices[idx].value = e.target.value
    this.forceUpdate()
  }

  renderABTeamsChoices(mounted) {
    let { values } = this.props.GameEventStore

    if (mounted) {
      if (this.props.item.choices && this.props.item.choices.length > 0) {
        return
      }
    }

    this.props.item.choices = []
    this.props.item.forParticipant = {}

    if (values) {
      if (values.participants && values.participants.length > 1) {
        for (let i = 0; i < values.participants.length; i++) {
          const t = values.participants[i]
          this.props.item.choices.push(t)
        }
      }
    }

    this.forceUpdate()
  }

  toggleSponsor(forceClose) {
    const el = this[`sponsor-${this.props.item.sequence}`]
    const elButton = this[`sponsor-button-${this.props.item.sequence}`]
    if (el && elButton) {
      if (forceClose) {
        el.className = el.className.replace(' open', '')
        new TimelineMax({ repeat: 0 }).set(el, { opacity: 0 }).to(el, 0.3, {
          height: 0,
          marginTop: 0,
          zIndex: -(100 - this.props.item.sequence),
          display: 'none',
        })
        elButton.style.backgroundColor = '#000000'
        return
      }

      if (el.classList.contains('open')) {
        el.className = el.className.replace(' open', '')
        new TimelineMax({ repeat: 0 }).set(el, { opacity: 0 }).to(el, 0.3, {
          height: 0,
          marginTop: 0,
          zIndex: -(100 - this.props.item.sequence),
          display: 'none',
        })
        elButton.style.backgroundColor = '#000000'
      } else {
        el.className += ' open'
        new TimelineMax({ repeat: 0 })
          .to(el, 0.3, {
            height: vhToPx(text_editor_height),
            marginTop: vhToPx(0.2),
            zIndex: 100 - this.props.item.sequence,
            display: 'flex',
          })
          .set(el, { opacity: 1 })
        elButton.style.backgroundColor = '#c61818'
      }

      this.forceUpdate()
    }
  }

  handleShowSponsor() {
    this.toggleSponsor()
  }

  handleUpdatedSponsorValue(info) {
    const strippedHTMLTags = info.value.toString().replace(/(<([^>]+)>)/gi, '')
    this.props.item.info[info.type] =
      strippedHTMLTags.trim().length > 0 ? info.value : ''

    this.props.updatedInfo()
    this.forceUpdate()
  }

  handleUpdatedSponsorBrand(val) {
    this.props.item.sponsor = val || {}
    this.forceUpdate()
  }

  componentWillUnmount() {
    this.destroyTeamUpdated()
  }

  componentDidUpdate() {
    const parse = val => {
      return JSON.parse(JSON.stringify(val))
    }

    if (
      this.props.GameEventStore.unchangedValues &&
      this.props.GameEventStore.unchangedValues.gameId
    ) {
      if (
        !isEqual(
          parse(this.props.GameEventStore.unchangedValues),
          parse(this.props.GameEventStore.values)
        )
      ) {
        this.props.GameEventStore.setUpdating(true)
      } else {
        this.props.GameEventStore.setUpdating(false)
      }
    }
  }

  componentDidMount() {
    this.renderABTeamsChoices(true)
  }

  render() {
    let { item, dIndex, GameEventStore, refHandleRemove } = this.props
    const editable = GameEventStore.leap.isLeap
      ? true
      : GameEventStore.values.stage
      ? GameEventStore.gameStatus[GameEventStore.values.stage].prePicksEditable
      : true

    /*
    //TEMPORARY
    if (item.promo.sponsor) {
      item.sponsor = item.promo.sponsor
    }
    if (item.promo.info) {
      item.info = {value:'',font:'',color:''}
      item.info.value = item.promo.info.value
      item.info.font = item.promo.info.font
      item.info.color = item.promo.info.color
    }
*/

    const expandableSponsor = editable
      ? true
      : Object.keys(item.sponsor).length > 0
      ? true
      : false

    return (
      <Draggable
        draggableId={item.sequence}
        index={dIndex}
        isDragDisabled={editable ? false : true}
      >
        {(provided, snapshot) => (
          <Container
            innerRef={provided.innerRef}
            {...provided.draggableProps}
            //zIndex={1000 - index}
          >
            <Wrapper isDragging={snapshot.isDragging}>
              <OverallLock {...provided.dragHandleProps}>
                <ItemImage
                  src={editable ? DnDIcon : LockIcon}
                  heightInPct={editable ? 100 : 50}
                />
              </OverallLock>
              <Sequence>{item.sequence}</Sequence>
              <DDChoiceType
                value={item.choiceType}
                onChange={this.handleChoiceTypeChange.bind(this)}
                disabled={!editable}
              >
                <option value={'ab'}>A-B (TEAMS)</option>
                <option value={'multi'}>A-B</option>
              </DDChoiceType>
              <TextBox
                readOnly={!editable}
                type="text"
                placeholder="header"
                widthInPct={10}
                value={item.questionHeader || ''}
                onChange={this.handleQuestionHeaderChange.bind(this)}
                style={{ borderRight: `${vhToPx(0.2)} solid #f2f2f2` }}
                onFocus={this.handleInputFocus.bind(this)}
              />
              <TextBox
                readOnly={!editable}
                type="text"
                placeholder="detail"
                widthInPct={26}
                value={item.questionDetail || ''}
                onChange={this.handleQuestionDetailChange.bind(this)}
                onFocus={this.handleInputFocus.bind(this)}
              />
              <ChoiceWrap
                backgroundColor={
                  item.choices.length > 0 ? '#ffffff' : '#0fbc1c'
                }
              >
                {item.choiceType === 'ab'
                  ? (item.choices || []).map((team, idx) => {
                      const isMargined =
                        idx < item.choices.length - 1 ? true : false
                      return (
                        <ChoiceItemAB
                          key={`${team.id}-${team.name}-${team.initial}-${team.topColor}-${team.bottomColor}`}
                          margined={isMargined}
                          onClick={this.handleInputFocus.bind(this)}
                        >
                          <ChoiceItemTeamName>{team.name}</ChoiceItemTeamName>
                          <TeamIcon
                            teamInfo={team}
                            size={3.5}
                            outsideBorderColor={'#000000'}
                            outsideBorderWidth={0.15}
                            font={'pamainextrabold'}
                          />
                        </ChoiceItemAB>
                      )
                    })
                  : (item.choices || []).map((choice, idx) => {
                      const isMargined =
                        idx < item.choices.length - 1 ? true : false
                      return (
                        <ChoiceItemMultiInput
                          readOnly={!editable}
                          type="text"
                          key={`${item.sequence}-${choice.id}`}
                          margined={isMargined}
                          value={choice.value || ''}
                          onChange={this.handleQuestionChoiceChange.bind(
                            this,
                            idx
                          )}
                          onFocus={this.handleInputFocus.bind(this)}
                        />
                      )
                    })}
              </ChoiceWrap>
              <ForTeamWrap>
                {item.choiceType === 'ab' ? (
                  <ItemImage src={LockIcon} />
                ) : (
                  <DDTeam
                    item={item}
                    teams={GameEventStore.values.participants}
                    height={h}
                    selectedTeam={this.handleSelectedTeam.bind(this)}
                    locked={!editable}
                  />
                )}
              </ForTeamWrap>

              <ShowSponsorButton
                innerRef={ref =>
                  (this[`sponsor-button-${item.sequence}`] = ref)
                }
                isEditable={expandableSponsor}
                onClick={
                  expandableSponsor ? this.handleShowSponsor.bind(this) : null
                }
              />

              {this.numberOfChoicesComponent}
              <Remove
                isEditable={editable}
                onClick={editable ? refHandleRemove : null}
              >
                <ItemImage src={editable ? XIcon : LockIcon} />
              </Remove>
            </Wrapper>

            <SponsorWrap
              innerRef={ref => (this[`sponsor-${item.sequence}`] = ref)}
              zIndex={1000 - item.sequence}
            >
              <InnerWrap widthInPct={71.7}>
                {editable ? (
                  <TextEditor
                    height={h}
                    value={item.info.value}
                    font={item.info.font}
                    color={item.info.color}
                    updatedValue={this.handleUpdatedSponsorValue.bind(this)}
                    handleFocus={this.handleInputFocus.bind(this)}
                    reference={`sponsor-editor-${item.sequence}`}
                  />
                ) : (
                  <TextEditorLocked
                    widthInPct={71.7}
                    dangerouslySetInnerHTML={{ __html: item.info.value }}
                  />
                )}
              </InnerWrap>
              <InnerWrap widthInPct={28.3}>
                <DDSponsorBrand
                  height={h}
                  index={`ddsponsor-${item.sequence}`}
                  selectedSponsor={item.sponsor}
                  //updatedSponsor={this.handleUpdatedBrand.bind(this)}
                  value={this.handleUpdatedSponsorBrand.bind(this)}
                  locked={!editable}
                />
              </InnerWrap>
            </SponsorWrap>
          </Container>
        )}
      </Draggable>
    )
  }
}

let text_editor_height = 0
let h = 0
const Container = styled.div`
  width: 100%;
  //height: ${props => vhToPx(h)};
  //background: #ffffff;
  margin-bottom: ${props => vhToPx(0.2)};
  display: flex;
  flex-direction: column;
  position: relative;
`

const Wrapper = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  display: flex;
  flex-direction: row;
`

const OverallLock = styled.div`
  width: 4%;
  height: 100%;
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ItemImage = styled.img`
  height: ${props => props.heightInPct || 50}%;
`

const LockImagex = styled.div`
  width: 100%;
  height: 100%;
  background-color: #a7a9ac;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${LockIcon});
    background-repeat: no-repeat;
    background-size: 50%;
    background-position: center;
    opacity: 0.3;
  }
`

const Sequence = styled.div`
  width: 4%;
  height: 100%;
  background-color: #0fbc1c;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  color: #ffffff;
`

const DDChoiceType = styled.select`
  width: 10%;
  height: ${props => vhToPx(h)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  background-image: url(${UpArrowIcon});
  background-repeat: no-repeat;
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-size: ${props => vhToPx(2)};
  text-align-last: center;
  margin-right: ${props => vhToPx(0.2)};

  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  line-height: 1;
  text-transform: uppercase;
  background-color: #d3d3d3;
`

const TextBox = styled.input`
  font-family: ${props => props.font || 'pamainbold'};
  font-size: ${props => vhToPx(h * 0.4)};
  width: ${props => props.widthInPct || 100}%;
  height: ${props => vhToPx(h)};
  border: none;
  outline: none;
  text-indent: ${props => vwToPx(0.4)};
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.1)};
  &::placeholder {
    color: #cccccc;
  }
  &::-ms-input-placeholder {
    color: #cccccc;
  }
  &::-webkit-input-placeholder {
    color: #cccccc;
  }
`

const ChoiceWrap = styled.div`
  width: 34%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: space-between;
`

const ChoiceItemAB = styled.div`
  width: 100%;
  height: 100%;
  background-color: #0fbc1c;
  ${props => (props.margined ? `margin-right:${vwToPx(0.1)};` : ``)};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
`

const ChoiceItemTeamName = styled.div`
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  color: #ffffff;
  text-transform: uppercase;
  line-height: 1;
  height: ${props => vhToPx(h * 0.4 * 0.8)};
  letter-spacing: ${props => vhToPx(0.1)};
  margin-right: 5%;
`

const ChoiceItemMultiInput = styled.input`
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  color: #ffffff;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.1)};
  background-color: #0fbc1c;
  ${props => (props.margined ? `margin-right:${vwToPx(0.1)};` : ``)};
  &::placeholder {
    color: #cccccc;
  }
  &::-ms-input-placeholder {
    color: #cccccc;
  }
  &::-webkit-input-placeholder {
    color: #cccccc;
  }
`

const ForTeamWrap = styled.div`
  width: 4%;
  height: 100%;
  background-color: #d3d3d3;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ShowSponsorButton = styled.div`
  width: 4%;
  height: 100%;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.isEditable ? 'pointer' : 'default')};
  opacity: ${props => (props.isEditable ? 1 : 0.3)};
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${TypeIcon});
    background-repeat: no-repeat;
    background-size: 55%;
    background-position: center;
  }
`

const ShowSponsorButtonX = styled.div`
  width: 4%;
  height: 100%;
  background-color: #000000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'T';
    font-family: pamainextrabold;
    font-size: ${props => vhToPx(h * 0.7)};
    color: #eaeaea;
    font-weight: bold;
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx(h * 0.7 * 0.85)};
    padding-bottom: 15%;
  }
`

const Remove = styled.div`
  width: 4%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => (props.isEditable ? 'cursor' : 'default')};
  background-color: #bfbfbf;
  &:hover {
    opacity: ${props => (props.isEditable ? 0.7 : 1)};
  }
`

const NumberOfChoicesPopup = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #d3d3d3;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  z-index: 10;
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

const NumberOfChoicesButton = styled.div`
  width: 10%;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${props => vhToPx(0.1)} solid #000000;
  margin-left: 1%;
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    line-height: 1;
    letter-spacing: ${props => vhToPx(0.1)};
    text-transform: uppercase;
    color: #000000;
    margin-top: 3%;
  }
`

const SponsorWrap = styled.div`
  width: 88%;
  height: 0;
  display: none;
  opacity: 0;
  margin-left: 8%;
  z-index: ${props => -props.zIndex};
`

const InnerWrap = styled.div`
  width: ${props => props.widthInPct || 100}%;
  height: ${props => vhToPx(h)};
  display: flex;
  margin-left: ${props => vhToPx(0.2)};
`

const TextEditorLocked = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  display: flex;
  align-items: center;
  padding-left: ${props => vhToPx(0.2)};
  background-color: #ffffff;
  text-transform: uppercase;
  padding-top: 2%;
  padding-left: 3%;
`
