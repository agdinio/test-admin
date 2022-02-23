import React, { Component } from 'react'
import styled from 'styled-components'
import { vhToPx } from '@/utils'
import { extendObservable, intercept } from 'mobx'
import { inject, observer } from 'mobx-react'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
import GameEventItem from '@/Components/Events/GameEvents/GameEventItem'
import TeamIcon from '@/Components/Common/TeamIcon'
import ImportExportArrowsIcon from '@/assets/images/import-export-arrows.svg'
import ArrowDownIcon from '@/assets/images/icon-arrow-down.svg'

@inject('GameEventStore')
@observer
export default class ImportPlaystackModal extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      events: null,
      isFinding: false,
      selectedGameEvent: null,
      activityIndicator: null,
      started: false,
      playstack: [],
      selectedPlaysCount: 0,
    })
  }

  handleCancelClick() {
    this.props.canceled()
  }

  handlePlaystackCheckChange(e) {
    if (e.target.checked) {
      this.playstack.forEach((play, idx) => {
        play.checked = 1
        this[`play-checkbox${idx}`].checked = 1
      })
      this.selectedPlaysCount = this.playstack.length
    } else {
      this.playstack.forEach((play, idx) => {
        play.checked = 0
        this[`play-checkbox${idx}`].checked = 0
      })
      this.selectedPlaysCount = 0
    }
  }

  handlePlayCheckChange(idx, e) {
    this.playstack[idx].checked = e.target.checked ? 1 : 0
    this.selectedPlaysCount = e.target.checked
      ? this.selectedPlaysCount + 1
      : this.selectedPlaysCount - 1
    if (this.playstack.length === this.selectedPlaysCount) {
      if (this.playCheckboxHeader) {
        this.playCheckboxHeader.checked = 1
      }
    } else if (this.playstack.length > this.selectedPlaysCount) {
      if (this.playCheckboxHeader) {
        this.playCheckboxHeader.checked = 0
      }
    }
  }

  handleImportClick() {
    if (this.refImportButton) {
      this.refImportButton.style.pointerEvents = 'none'
      document.styleSheets[0].addRule(
        '#ref-import-button:before',
        'content: "import started";'
      )
    }
    if (this.refCancelButton) {
      this.refCancelButton.style.pointerEvents = 'none'
      this.refCancelButton.style.opacity = 0.2
    }
    if (this.refContinueLabel) {
      this.refContinueLabel.innerHTML = 'started importing. please wait...'
    }

    this.activityIndicator = <ActivityIndicator height={5} color={'#ffffff'} />
    this.started = true

    this.props.GameEventStore.importPlaystack({
      source: this.selectedGameEvent.gameId,
      destination: this.props.item.gameId,
      playsToImport: this.playstack,
    }).then(res => {
      if (res.status === 200) {
        if (this.refContinueLabel) {
          this.refContinueLabel.innerHTML = 'finished importing.'
        }

        this.props.GameEventStore.values.playCount = res.data.data.playCount
        this.props.GameEventStore.unchangedValues.playCount =
          res.data.data.playCount
      } else {
        if (this.refContinueLabel) {
          this.refContinueLabel.innerHTML =
            'importing failed. please try again.'
        }
        this.started = false
      }

      if (this.refImportButton) {
        this.refImportButton.style.pointerEvents = 'none'
        this.refImportButton.style.display = 'none'
        document.styleSheets[0].addRule(
          '#ref-import-button:before',
          'content: "import playstack";'
        )
      }
      if (this.refCancelButton) {
        this.refCancelButton.style.pointerEvents = 'auto'
        this.refCancelButton.style.opacity = 1
      }
      this.activityIndicator = null
    })
  }

  refHandleSelectedGameEvent(gameEvent) {
    this.isFinding = true
    this.selectedGameEvent = null

    this.props.GameEventStore.getGamePlaysByGameId({ gameId: gameEvent.gameId })
      .then(response => {
        if (response.status == 200) {
          this.selectedGameEvent = gameEvent
          this.playstack = response.data.data[0]
        }
      })
      .finally(_ => {
        this.isFinding = false
      })
  }

  componentDidMount() {
    this.isFinding = true
    this.props.GameEventStore.getEventsBySportType({
      sportType: this.props.item.sportType.code,
      subSportGenre: '',
      excludedGameId: this.props.item.gameId,
    })
      .then(data => {
        this.isFinding = false
        this.events = data
      })
      .catch(err => {
        this.isFinding = false
        this.showErrorPage = true
      })
  }

  render() {
    let { item } = this.props

    return (
      <Container>
        <Wrapper>
          {this.events && this.events.length > 0 ? (
            <Section justifyContent="space-between" style={{ height: '70%' }}>
              <Section
                className="left-panel"
                direction="column"
                alignItems="center"
              >
                <Label
                  font="pamainregular"
                  size="3"
                  color={'#d3d3d3'}
                  uppercase
                >
                  select a game event to import playstack
                </Label>
                <Section direction="row" justifyContent="center" marginTop="3">
                  {this.events.map((item, idx) => {
                    return (
                      <GameEventItemWrap
                        key={`importplaystack-${item.keyEventType}-${item.keySportType.code}`}
                        marginRight={idx === 0 ? 1 : 0}
                      >
                        {this.started ? <Blocker key={`blocker-idx`} /> : null}
                        <GameEventItem
                          eventItem={item}
                          selectedGameEvent={this.refHandleSelectedGameEvent.bind(
                            this
                          )}
                          scaleSize={0.5}
                          forImport
                        />
                      </GameEventItemWrap>
                    )
                  })}
                </Section>
              </Section>

              <Section
                className="middle-panel"
                widthInPct="0.1"
                style={{ backgroundColor: '#d3d3d3' }}
              />

              <Section className="right-panel">
                {this.selectedGameEvent ? (
                  <Section direction="column">
                    <Section justifyContent="center">
                      <Label
                        font="pamainregular"
                        size="3"
                        color={'#d3d3d3'}
                        uppercase
                      >
                        you are attempting to import playstack from:
                      </Label>
                    </Section>
                    <Section justifyContent="center" marginTop="2">
                      <Label
                        font={'pamainregular'}
                        size={3}
                        color={'#d3d3d3'}
                        uppercase
                        nowrap
                      >
                        {this.selectedGameEvent.gameId}
                      </Label>
                    </Section>
                    <Section
                      justifyContent={'center'}
                      flexDirection={'row'}
                      marginTop={1.5}
                    >
                      <TeamSection>
                        <TeamIconWrap>
                          <TeamIcon
                            teamInfo={this.selectedGameEvent.participants[0]}
                            size={3}
                            outsideBorderColor={'#ffffff'}
                            outsideBorderWidth={0.2}
                          />
                          &nbsp;
                          <Label
                            font={'pamainlight'}
                            size={3}
                            marginBottom={3}
                            color={'#d3d3d3'}
                            uppercase
                            nospacing
                          >
                            {this.selectedGameEvent.participants[0].name}
                          </Label>
                        </TeamIconWrap>
                        <TeamVS>
                          <Label font={'pamainextrabold'} size={2} uppercase>
                            &nbsp;&nbsp;vs&nbsp;&nbsp;
                          </Label>
                        </TeamVS>
                        <TeamIconWrap>
                          <TeamIcon
                            teamInfo={this.selectedGameEvent.participants[1]}
                            size={3}
                            outsideBorderColor={'#ffffff'}
                            outsideBorderWidth={0.2}
                          />
                          &nbsp;
                          <Label
                            font={'pamainlight'}
                            size={3}
                            marginBottom={3}
                            color={'#d3d3d3'}
                            uppercase
                            nospacing
                          >
                            {this.selectedGameEvent.participants[1].name}
                          </Label>
                        </TeamIconWrap>
                      </TeamSection>
                    </Section>
                    <Section justifyContent="center" marginTop="1.5">
                      <Label
                        font="pamainlight"
                        size="2"
                        color={'#d3d3d3'}
                        uppercase
                      >{`total number of play(s): ${this.selectedGameEvent.playCount}`}</Label>
                    </Section>

                    <Section
                      direction="column"
                      alignItems="center"
                      marginTop={1}
                    >
                      <PlayHeader>
                        <PlayCheckBox widthInPct="4.5" backgroundColor={'#000'}>
                          <input
                            type="checkbox"
                            onChange={this.handlePlaystackCheckChange.bind(
                              this
                            )}
                            ref={ref => (this.playCheckboxHeader = ref)}
                          />
                        </PlayCheckBox>
                        <div style={{ width: '100%' }} />
                      </PlayHeader>
                      <ScrollingPlayWrap>
                        <ContentPlayWrap>
                          {(this.playstack || []).map((play, idx) => {
                            return (
                              <PlayCompWrap
                                key={`play-comp-${play.game_play_id}`}
                              >
                                <PlayCheckBox widthInPct="5">
                                  <input
                                    type="checkbox"
                                    value={play.checked}
                                    ref={ref =>
                                      (this[`play-checkbox${idx}`] = ref)
                                    }
                                    onChange={this.handlePlayCheckChange.bind(
                                      this,
                                      idx
                                    )}
                                  />
                                </PlayCheckBox>
                                <PlayComp item={play} />
                              </PlayCompWrap>
                            )
                          })}
                        </ContentPlayWrap>
                      </ScrollingPlayWrap>
                    </Section>
                    <Section justifyContent="center" marginTop="1.5">
                      <Label
                        font="pamainlight"
                        size="2"
                        color={'#d3d3d3'}
                        uppercase
                      >{`selected play(s): ${this.selectedPlaysCount}`}</Label>
                    </Section>
                    <Section justifyContent="center" marginTop="6">
                      <Label
                        font="pamainregular"
                        size="2.5"
                        color={'#d3d3d3'}
                        uppercase
                        innerRef={ref => (this.refContinueLabel = ref)}
                      >
                        do you want to continue?
                      </Label>
                    </Section>
                    <Section justifyContent="center" marginTop="2">
                      <ImportButton
                        id={'ref-import-button'}
                        locked={this.selectedPlaysCount < 1}
                        innerRef={ref => (this.refImportButton = ref)}
                        onClick={
                          this.selectedPlaysCount > 0
                            ? this.handleImportClick.bind(this)
                            : null
                        }
                      >
                        {this.activityIndicator}
                      </ImportButton>
                    </Section>
                  </Section>
                ) : this.isFinding ? (
                  <Section
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ActivityIndicator color={'#d3d3d3'} height={5} />
                    <Label size="2.5" color={'#d3d3d3'} uppercase>
                      fetching playstack. please wait...
                    </Label>
                  </Section>
                ) : (
                  <IconImport />
                )}
              </Section>
            </Section>
          ) : this.isFinding ? (
            <Section
              direction="row"
              alignItems="center"
              justifyContent="center"
            >
              <ActivityIndicator color={'#d3d3d3'} height={5} />
              <Label size="2.5" color={'#d3d3d3'} uppercase>
                fetching game events to import
              </Label>
            </Section>
          ) : !this.events ? null : (
            <Section justifyContent="center">
              <Label font="pamainregular" size="3" color={'#d3d3d3'} uppercase>
                NO AVAILABLE GAME EVENT(S) PLAYSTACK FOR IMPORT
              </Label>
            </Section>
          )}

          <Section justifyContent={'center'} marginTop={6}>
            <Label
              font={'pamainregular'}
              size={1.8}
              color={'#d3d3d3'}
              uppercase
              nowrap
              cursor={'pointer'}
              innerRef={ref => (this.refCancelButton = ref)}
              onClick={this.handleCancelClick.bind(this)}
            >
              close and return back to game event
            </Label>
          </Section>
        </Wrapper>
      </Container>
    )
  }
}

const Container = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.95);
  overflow: hidden;
`

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Section = styled.div`
  width: ${props => props.widthInPct || 100}%;
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
  color: ${props => props.color || '#ffffff'};
  line-height: ${props => props.lineHeight || 1};
  ${props => (props.uppercase ? 'text-transform: uppercase;' : '')} ${props =>
    props.italic ? 'font-style: italic;' : ''};
  ${props =>
    props.nowrap
      ? `white-space: nowrap; backface-visibility: hidden; -webkit-backface-visibility: hidden;`
      : ''};
  letter-spacing: ${props => vhToPx(props.nospacing ? 0 : 0.1)};
  cursor: ${props => props.cursor || 'default'};
  margin-bottom: ${props => props.marginBottom || 0}%;
`

const GameEventItemWrap = styled.div`
  width: 30%;
  margin-right: ${props => props.marginRight || 0}%;
  position: relative;
`

const TeamSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamIconWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const TeamVS = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: 2%;
`

const ImportButton = styled.div`
  height: ${props => vhToPx(5)};
  background-color: #18c5ff;
  display: flex;
  align-items: center;
  cursor: ${props => (props.locked ? 'not-allowed' : 'pointer')};
  padding: 0 ${props => vhToPx(1.5)} 0 ${props => vhToPx(1.5)};
  &:before {
    content: 'import playstack';
    font-family: pamainbold;
    fonts-size: ${props => vhToPx(3)};
    color: #ffffff;
    line-height: 1;
    letter-spacing: ${props => vhToPx(0.1)};
    text-transform: uppercase;
  }
`
const Blocker = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 200;
`

const IconImport = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    width: 100%;
    height: 100%;
    content: '';
    display: inline-block;
    background-image: url(${ImportExportArrowsIcon});
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15%;
  }
`

const IconArrowDown = styled.img`
  height: ${props => vhToPx(3)};
`

const ScrollingPlayWrap = styled.div`
  position: relative;
  width: 70%;
  height: ${props => vhToPx(30)};
  max-height: ${props => vhToPx(30)};
  overflow-y: scroll;
  background-color: #eaeaea;
`

const ContentPlayWrap = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const PlayCompWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`

const PlayHeader = styled.div`
  width: 70%;
  height: ${props => vhToPx(PCHeight)};
  border-top: ${props => vhToPx(0.1)} solid #ffffff;
  border-right: ${props => vhToPx(0.1)} solid #ffffff;
  border-left: ${props => vhToPx(0.1)} solid #ffffff;
  display: flex;
  flex-direction: row;
`

const PlayCheckBox = styled.div`
  width: ${props => props.widthInPct}%;
  height: ${props => vhToPx(PCHeight)};
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.backgroundColor || '#ffffff'};
`

const PCHeight = 3
const PCContainer = styled.div`
  width: 100%;
  height: ${props => vhToPx(PCHeight)};
  margin-bottom: ${props => vhToPx(0.3)};
  display: flex;
  justify-content: space-between;
`

const PCType = styled.div`
  width: 50%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  font-family: pamainregular;
  font-size: ${props => vhToPx(PCHeight * 0.5)};
  text-transform: uppercase;
  color: #ffffff;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1%;
`

const PCPreset = styled.div`
  width: 50%;
  height: 100%;
  background-color: #ffffff;
  font-family: pamainregular;
  font-size: ${props => vhToPx(PCHeight * 0.5)};
  text-transform: uppercase;
  color: #000000;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 1%;
`

const PCQuestion = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  font-family: pamainregular;
  font-size: ${props => vhToPx(PCHeight * 0.5)};
  text-transform: uppercase;
  color: #000000;
  line-height: 1;
  display: flex;
  align-items: center;
  padding-left: 2%;
`

const PCTypCondition = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
`

const PCAnnounceHeader = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: #ffffff;
  margin-right: 1%;
  padding-left: 2%;
  text-align: center;
  text-transform: uppercase;
  padding-top: ${props => vhToPx(0.3)};
`

const PCAnnounceMiddle = styled.div`
  width: 50%;
  height: 100%;
  display: flex;
  background-color: #ffffff;
  padding-left: 2%;
  text-align: center;
  text-transform: uppercase;
  padding-top: ${props => vhToPx(0.3)};
`

const PlayColors = {
  LivePlay: '#c61818',
  GameMaster: '#19d1bf',
  Sponsor: '#495bdb',
  Prize: '#9368aa',
  Announce: '#000000',
}

const PlayComp = props => {
  let { item } = props

  return (
    <PCContainer>
      <PCType backgroundColor={PlayColors[item.type]}>{item.type}</PCType>
      {'announce' === item.type.toLowerCase() ? (
        <PCTypCondition>
          <PCAnnounceHeader
            dangerouslySetInnerHTML={{ __html: item.announce_header }}
          />
          <PCAnnounceMiddle dangerouslySetInnerHTML={{ __html: '...' }} />
        </PCTypCondition>
      ) : (
        <PCTypCondition>
          <PCPreset>{item.preset_id}</PCPreset>
          <PCQuestion>{item.parent_question}</PCQuestion>
        </PCTypCondition>
      )}
    </PCContainer>
  )
}
