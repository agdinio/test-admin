import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable, runInAction, intercept } from 'mobx'
import { vhToPx, vwToPx, isEqual, evalImage, vhToPxNum } from '@/utils'
import PPItem from '@/Components/Events/GameDetail/PPItem'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'

@inject('GameEventStore')
@observer
export default class PrePicks extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      scrolling: false,
    })
    h = this.props.GameEventStore.baseHeight
    //this.defaultValues = JSON.parse(JSON.stringify(this.props.GameEventStore.values))

    this.destroyPresets = intercept(
      this.props.GameEventStore,
      'prePickPresets',
      change => {
        if (change.newValue && Array.isArray(change.newValue)) {
          const maxSequence =
            this.props.GameEventStore.values.prePicks &&
            Array.isArray(
              JSON.parse(
                JSON.stringify(this.props.GameEventStore.values.prePicks)
              )
            )
              ? this.props.GameEventStore.values.prePicks.length
              : 0
          change.newValue.forEach((item, idx) => {
            item.sequence = maxSequence + (idx + 1)
            this.props.GameEventStore.values.prePicks.push(item)
          })
          this.forceUpdate()
        }
        return change
      }
    )
  }

  handleAddClick() {
    let { values } = this.props.GameEventStore

    if (
      !values.participants ||
      (values.participants && values.participants.length < 2)
    ) {
      this.props.showErrorMessage('Please add teams or participants.')
      return
    }

    let cnt = 0
    for (let i = 0; i < values.participants.length; i++) {
      const participant = values.participants[i]
      if (!participant.name || !participant.initial) {
        cnt += 1
      }
    }

    if (cnt > 0) {
      this.props.showErrorMessage('Participants should not be empty.')
      return
    }

    let { prePicks } = this.props.GameEventStore.values
    const sequence =
      prePicks && prePicks.length > 0
        ? prePicks[prePicks.length - 1].sequence + 1
        : 1
    const newItem = {
      sequence: sequence,
      question: '',
      questionHeader: '',
      questionDetail: '',
      choiceType: 'ab',
      choices: [],
      forParticipant: {},
      shortHand: '',
      sponsor: {},
      info: { value: '', font: 'pamainbold', color: '#000000' },
    }

    prePicks.push(newItem)
    this.props.refUpdatedPrePickInfo()
    this.forceUpdate()
  }

  handleRemoveClick(sequence) {
    let { prePicks } = this.props.GameEventStore.values

    const idxToRemove = prePicks.findIndex(o => o.sequence === sequence)
    if (idxToRemove > -1) {
      prePicks.splice(idxToRemove, 1)
      for (let i = 0; i < prePicks.length; i++) {
        prePicks[i].sequence = i + 1
      }
    }

    this.handleUpdatedInfo()

    this.forceUpdate()
  }

  handleRefPrePickItemFocus(item) {
    if (this.props.refPrePickItemFocus) {
      this.props.refPrePickItemFocus(item)
    }
  }

  handleUpdatedInfo(pp) {
    if (this.props.refUpdatedPrePickInfo) {
      this.props.refUpdatedPrePickInfo()
    }
  }

  onDragStart = () => {}

  onDragEnd = result => {
    const { source, destination, draggableId } = result

    if (!destination) {
      return
    }

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const newItem = this.props.GameEventStore.values.prePicks.filter(
      o => o.sequence === draggableId
    )[0]
    if (newItem) {
      this.props.GameEventStore.values.prePicks.splice(source.index, 1)
      this.props.GameEventStore.values.prePicks.splice(
        destination.index,
        0,
        newItem
      )
    }
  }

  componentWillUnmount() {
    this.destroyPresets()
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

    this.toggleScrolling()
  }

  toggleScrolling() {
    const content = document.getElementById('prepicks-content')
    if (content) {
      if (content.offsetHeight >= vhToPxNum(80)) {
        runInAction(() => (this.scrolling = true))
      } else {
        runInAction(() => (this.scrolling = false))
      }
    }
  }

  render() {
    let { GameEventStore } = this.props

    return (
      <Container>
        <ContentScrolling isScrolling={this.scrolling}>
          <DragDropContext
            onDragStart={this.onDragStart}
            onDragEnd={this.onDragEnd}
            //onDragUpdate={this.onDragUpdate}
          >
            <Droppable droppableId={'prePicksDroppable'}>
              {provided => (
                <Content
                  innerRef={provided.innerRef}
                  {...provided.droppableProps}
                  id="prepicks-content"
                >
                  {(GameEventStore.values.prePicks || []).map((pp, dIndex) => {
                    return (
                      <PPItem
                        key={pp.sequence}
                        item={pp}
                        dIndex={dIndex}
                        height={GameEventStore.baseHeight}
                        refHandleRemove={this.handleRemoveClick.bind(
                          this,
                          pp.sequence
                        )}
                        refPrePickItemFocus={this.handleRefPrePickItemFocus.bind(
                          this
                        )}
                        updatedInfo={this.handleUpdatedInfo.bind(this)}
                      />
                    )
                  })}
                  {provided.placeholder}
                </Content>
              )}
            </Droppable>
          </DragDropContext>
        </ContentScrolling>
        {GameEventStore.leap && GameEventStore.leap.isLeap ? (
          <AddButton onClick={this.handleAddClick.bind(this)} />
        ) : GameEventStore.values.stage === 'pregame' ||
          GameEventStore.values.stage === 'pending' ||
          GameEventStore.values.stage === 'live' ? null : (
          <AddButton onClick={this.handleAddClick.bind(this)} />
        )}
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
`

const ContentScrolling = styled.div`
  width: 100%;
  max-height: ${props => vhToPx(80)};
  display: flex;
  flex-direction: column;

  overflow-y: ${props => (props.isScrolling ? 'scroll' : 'none')};
  -webkit-overflow-scrolling: touch;

  -ms-overflow-style: ${props =>
    props.isScrolling ? '-ms-autohiding-scrollbar;' : 'none'};
  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(1)} rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar {
    width: ${props => vhToPx(1)};
    background-color: #f5f5f5;
  }
  &::-webkit-scrollbar-thumb {
    -webkit-box-shadow: inset 0 0 ${props => vhToPx(1)} rgba(0, 0, 0, 0.3);
    background-color: rgba(85, 85, 85, 0.5);
    &:hover {
      background-color: #555;
    }
  }
`

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const AddButton = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #d3d3d3;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:before {
    content: '+';
    font-family: pamainregular;
    font-size: ${props => vhToPx(h * 0.5)};
    color: #939598;
    line-height: 1;
    margin-top: 0.2%;
  }
  &:after {
    content: 'ADD PRE-PICK';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: #939598;
    line-height: 1;
    margin-top: 0.3%;
  }
`

const PlusSign = styled.span`
  height: inherit;
  font-family: pamainregular;
  font-size: ${props => vhToPx(h * 0.5)};
  display: flex;
  justify-content: center;
  align-items: center;
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

const PrepPickItem = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background: #0fbc1c;
  margin-bottom: ${props => vhToPx(0.2)};
`
