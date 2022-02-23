import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { extendObservable, intercept, observe } from 'mobx'
import { vhToPx, vwToPx, isEqual, evalImage, guid, addCommas } from '@/utils'
import { TimelineMax, TweenMax } from 'gsap'
import ProfileDefaultIcon from '@/assets/images/icon-profile_default.svg'
import ExitEventIcon from '@/assets/images/icon-update_save_exit.svg'
import SaveIcon from '@/assets/images/icon-update_save_exit-black.svg'
import PreviewIcon from '@/assets/images/preview/preview-icon.svg'
import 'react-datepicker/dist/react-datepicker.css'
import moment from 'moment-timezone'
import DetailCreating from '@/Components/Events/GameDetail/DetailCreating'
import DetailEditing from '@/Components/Events/GameDetail/DetailEditing'
import PrePicks from '@/Components/Events/GameDetail/PrePicks'
import ConfirmModal from '@/Components/Events/GameDetail/ConfirmModal'
import CancelModal from '@/Components/Events/GameDetail/CancelModal'
import ExitModal from '@/Components/Events/GameDetail/ExitModal'
import ImportPlaystackModal from '@/Components/Events/GameDetail/ImportPlaystackModal'
import SponsorItem from '@/Components/Common/SponsorItem'
import ActivityIndicator from '@/Components/Common/ActivityIndicator'
import LiveStats from './LiveStats'
import Preview from '@/Components/Events/GameDetail/Preview'
import dateFormat from 'dateformat'
import ServerError from '@/Components/Common/ServerError'

@inject(
  'NavigationStore',
  'GameEventStore',
  'PrePlayStore',
  'OperatorStore',
  'CommonStore'
)
export default class GameDetail extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: null,
      confirmModal: null,
      isUpdating: false,
      enableSaving: false,
      showPage: false,
      errorComponent: null,
      showErrorPage: false,
      overlayMessage: null,
      sportType: null,
    }

    this._isMounted = false
    this.accordionToggle = null
    this.accordionTimeout = null
    this.errorCompToggle = null
    this.isShownDraggablePreview = false
    this.draggablePreviewValue = null
    this.containerSize = { width: 0, height: 0 }
    this.isExitPage = false

    this.props.GameEventStore.resetLeap()
    this.props.PrePlayStore.sponsors = []

    /*
        if (sessionStorage.getItem('EVENT_VALUES')) {
          this.props.GameEventStore.setValues(JSON.parse(sessionStorage.getItem('EVENT_VALUES')))
        }
        if (sessionStorage.getItem('EVENT_UNCHANGED_VALUES')) {
          this.props.GameEventStore.setUnchangedValues(JSON.parse(sessionStorage.getItem('EVENT_UNCHANGED_VALUES')))
        }
    */

    this.destroyUpdating = intercept(
      this.props.GameEventStore,
      'isUpdating',
      change => {
        if (this._isMounted) {
          this.setState({ isUpdating: change.newValue })
        }
        return change
      }
    )

    this.destroyLeapUpdating = intercept(
      this.props.GameEventStore,
      'isLeapUpdating',
      change => {
        if (this._isMounted) {
          if (change.newValue) {
            this.setState({
              overlayMessage: (
                <FetchingIndicator
                  backgroundColor="rgba(34,34,34,0.9)"
                  zIndex="200"
                  text={'updating leap'}
                >
                  <ActivityIndicator color={'#ffffff'} height={5} />
                </FetchingIndicator>
              ),
            })
          } else {
            this.setState({ overlayMessage: null })
          }
        }
        return change
      }
    )

    this.destroySportType = intercept(
      this.props.GameEventStore.values,
      'sportType',
      change => {
        if (change.newValue) {
          this.setState({ sportType: change.newValue })
        }
        return change
      }
    )

    this.destroySponsorList = observe(
      this.props.PrePlayStore,
      'sponsors',
      change => {
        if (change.newValue) {
          this.forceUpdate()
        }
        return change
      }
    )
  }

  handleTimeFocus() {
    this.props.GameEventStore.values.timeStart = this.props.GameEventStore.values.timeStart
      .replace(moment.tz().zoneAbbr(), '')
      .trim()
  }

  handleTimeBlur() {
    if (
      this.props.GameEventStore.values.timeStart
        .replace(moment.tz().zoneAbbr(), '')
        .trim() &&
      !moment(
        this.props.GameEventStore.values.timeStart,
        'HH:mm',
        true
      ).isValid()
    ) {
      if (this.refStartTime) {
        this.refStartTime.style.border = `${vhToPx(0.1)} solid #ff0000`
      }
    } else {
      if (this.refStartTime) {
        this.refStartTime.style.border = `0 solid transparent`
        if (this.props.GameEventStore.values.timeStart.trim()) {
          this.props.GameEventStore.values.timeStart =
            this.props.GameEventStore.values.timeStart +
            ' ' +
            moment.tz().zoneAbbr()
        }
      }
    }
  }

  handleShowErrorMessage(msg) {
    const comp = (
      <ErrorComponent>
        <ErrorComponentInner>
          <ECWrapper>
            <ECCloseButton onClick={this.handleErrorMessageClose.bind(this)}>
              x
            </ECCloseButton>
            <ECMessage dangerouslySetInnerHTML={{ __html: msg }} />
          </ECWrapper>
        </ErrorComponentInner>
      </ErrorComponent>
    )
    this.setState({ errorComponent: comp })
    this.TimeoutErrorMessage = setTimeout(
      () => this.setState({ errorComponent: null }),
      8000
    )
  }

  handleUpdatedPrePickInfo() {
    if (this._isMounted) {
      this.forceUpdate()
    }
  }

  handleImportPlaystack() {
    const comp = (
      <ImportPlaystackModal
        item={this.props.GameEventStore.values}
        canceled={this.handleCanceled.bind(this)}
      />
    )
    this.setState({ confirmModal: comp })
  }

  handleLoadPresetClick() {
    let { values } = this.props.GameEventStore

    if (
      !values.participants ||
      (values.participants && values.participants.length < 2)
    ) {
      this.handleShowErrorMessage('Please add teams or participants.')
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
      this.handleShowErrorMessage('Participants should not be empty.')
      return
    }

    this.setState({
      overlayMessage: (
        <FetchingIndicator
          backgroundColor="rgba(34,34,34,0.9)"
          zIndex="200"
          text={'loading prepicks...'}
        >
          <ActivityIndicator color={'#ffffff'} height={5} />
        </FetchingIndicator>
      ),
    })

    this.props.GameEventStore.getPrePickPresets({
      sportTypeId: this.props.GameEventStore.values.sportType.id,
    }).then(next => {
      if (next) {
        this.setState({ overlayMessage: null })
      }
    })
  }

  handleShowPreviewClick() {
    if (this.isShownDraggablePreview) {
      this.draggablePreviewValue = null
      this.isShownDraggablePreview = false
    } else {
      // this.draggablePreview = (
      //   <Draggable
      //     positionOffset={{x: '100%', y: 0}}
      //     handle=".handle"
      //     grid={[5, 5]}
      //     scale={1}
      //     bounds="body"
      //     onDrag={this.handleDrag.bind(this)}
      //   >
      //     <div>
      //       <DragContainer className="handle">Drag from here</DragContainer>
      //       <div>This readme is really dragging on...</div>
      //     </div>
      //   </Draggable>
      // )
      if (this.refPreviewLocationGuide) {
        this.containerSize = {
          left: this.refPreviewLocationGuide.offsetLeft,
          top: this.refPreviewLocationGuide.offsetTop,
          width: this.refPreviewLocationGuide.offsetWidth,
          height: this.refPreviewLocationGuide.offsetHeight,
        }
      }
      this.isShownDraggablePreview = true
    }

    if (this._isMounted) {
      this.forceUpdate()
    }
  }

  handlePrePickItemFocus(item) {
    this.draggablePreviewValue = item

    if (this._isMounted) {
      this.forceUpdate()
    }
  }

  handleModalSave(mode) {
    if (mode === 'insert') {
      // const stage = Object.keys(this.props.GameEventStore.gameStatus).sort(() => {
      //   return Math.random() - 0.5;
      // })

      this.props.GameEventStore.saveEvent().then(next => {
        if (next) {
          this.setState({ confirmModal: null })
        }
      })

      // localStorage.clear()

      //this.props.NavigationStore.setCurrentView('/gameevents')
    } else if (mode === 'update') {
      this.props.GameEventStore.updateEvent().then(next => {
        if (next) {
          this.setState({ confirmModal: null })
        }
      })
    }
  }

  handleCanceled() {
    this.setState({ confirmModal: null })
  }

  handleSaveEventClick() {
    if (!this.readyForSaving()) {
      return
    }

    const { values } = this.props.GameEventStore

    if (!values.autofillGameId.date) {
      values.autofillGameId.date = `-${dateFormat(
        values.dateStart,
        'mmddyyyy'
      )}`
    }
    values.gameId =
      values.autofillGameId.sportType +
      values.autofillGameId.eventType +
      values.autofillGameId.dropdown +
      values.autofillGameId.generated +
      values.autofillGameId.teams +
      values.autofillGameId.date

    const modal = (
      <ConfirmModal
        item={values}
        create={this.handleModalSave.bind(this, 'insert')}
        canceled={this.handleCanceled.bind(this)}
        mode="insert"
      />
    )
    this.setState({ confirmModal: modal })
  }

  handleUpdateEventClick() {
    if (!this.readyForSaving()) {
      return
    }

    const modal = (
      <ConfirmModal
        item={this.props.GameEventStore.values}
        create={this.handleModalSave.bind(this, 'update')}
        canceled={this.handleCanceled.bind(this)}
        mode="update"
      />
    )
    this.setState({ confirmModal: modal })
  }

  handleErrorMessageClose() {
    if (this.TimeoutErrorMessage) {
      clearTimeout(this.TimeoutErrorMessage)
    }

    this.setState({ errorComponent: null })
  }

  readyForSaving() {
    if (this.errorCompToggle) {
      this.errorCompToggle.reverse(0)
    }
    if (this.reverseTO) {
      clearTimeout(this.reverseTO)
    }

    let { values } = this.props.GameEventStore

    let required = ''
    if (values.sportType && Object.keys(values.sportType).length < 1) {
      required = required + `<li>sport type</li>`
    }
    if (values.subSportGenre && Object.keys(values.subSportGenre).length < 1) {
      required = required + `<li>sub sport genre</li>`
    }

    let requiredVenue = ''
    if (!values.venue.state.code) {
      requiredVenue = requiredVenue + `<li>state</li>`
    }
    if (!values.venue.city.name) {
      requiredVenue = requiredVenue + `<li>city</li>`
    }
    if (!values.venue.stadiumName) {
      requiredVenue = requiredVenue + `<li>stadium</li>`
    }
    if (requiredVenue) {
      required = required + `<li>venue</li>`
      required = required + `<ul>`
      required = required + requiredVenue
      required = required + `</ul>`
    }

    if (!values.participants) {
      required = required + `<li>participants</li>`
    } else {
      let tcount = 0
      for (let i = 0; i < values.participants.length; i++) {
        const t = values.participants[i]
        if (!t.name) {
          tcount += 1
        }
        if (!t.initial) {
          tcount += 1
        }
      }

      if (tcount > 0) {
        required = required + `<li>participants</li>`
      }
    }

    let requiredDates = ''
    if (!values.dateStart) {
      requiredDates = requiredDates + `<li>start date</li>`
    }
    if (!values.timeStart) {
      requiredDates = requiredDates + `<li>start time</li>`
    }
    if (!values.dateAnnounce) {
      requiredDates = requiredDates + `<li>announce date</li>`
    }
    if (!values.datePrePicks) {
      requiredDates = requiredDates + `<li>prepicks date</li>`
    }
    if (requiredDates) {
      required = required + `<li>dates</li>`
      required = required + `<ul>`
      required = required + requiredDates
      required = required + `</ul>`
    }

    if (values.prePicks && values.prePicks.length > 0) {
      let p_array = []
      values.prePicks.forEach(p => {
        if (!p.questionHeader || !p.questionDetail) {
          const p_exists = p_array.filter(o => o === p.sequence)[0]
          if (!p_exists) {
            p_array.push(p.sequence)
          }
        }
        p.choices.forEach(choice => {
          if (p.choiceType !== 'ab') {
            if (!choice.value) {
              const p_exists = p_array.filter(o => o === p.sequence)[0]
              if (!p_exists) {
                p_array.push(p.sequence)
              }
            }
          }
        })
      })

      if (p_array.length > 0) {
        required = required + `<li>pre-picks</li>`
        required = required + `<ul>`
        p_array.forEach(seq => {
          required = required + `<li>sequence ${seq}</li>`
        })
        required = required + `</ul>`
      }
    }

    let msg = ''
    if (required) {
      msg = `<div style="font-family: pamainextrabold;">required fields:</div><ul>`
      msg = msg + required
      msg = msg + `</ul>`
    }

    // this.errorCompToggle = new TimelineMax({repeat: 0})
    //   .to(this.refErrorComp, 0.3, {opacity: 1, innerHTML: msg})
    //   .to(this.refErrorComp, 0.5, {opacity: 0, delay: 3})
    //   .set(this.refErrorComp, {innerHTML: ''})

    if (msg) {
      const comp = (
        <ErrorComponent>
          <ErrorComponentInner>
            <ECWrapper>
              <ECCloseButton onClick={this.handleErrorMessageClose.bind(this)}>
                x
              </ECCloseButton>
              <ECMessage dangerouslySetInnerHTML={{ __html: msg }} />
            </ECWrapper>
          </ErrorComponentInner>
        </ErrorComponent>
      )
      this.setState({ errorComponent: comp })
      this.TimeoutErrorMessage = setTimeout(
        () => this.setState({ errorComponent: null }),
        8000
      )

      return false
    }

    return true
  }

  handleExitEventClick() {
    // if (!this.props.GameEventStore.values.gameId) {
    //   const modal = (
    //     <ExitModal></ExitModal>
    //   )
    //   this.setState({ confirmModal: modal })
    // }
    this.isExitPage = true
    sessionStorage.removeItem('EVENT_VALUES')
    sessionStorage.removeItem('EVENT_UNCHANGED_VALUES')
    this.props.GameEventStore.resetValues()
    this.props.NavigationStore.setCurrentView('/gameevents')
  }

  handleCancelEventClick() {
    const { values } = this.props.GameEventStore

    const modal = (
      <CancelModal
        item={values}
        create={this.handleModalSave.bind(this, 'insert')}
        canceled={this.handleCanceled.bind(this)}
        mode="cancel"
      />
    )
    this.setState({ confirmModal: modal })
  }

  handleAccordionButtonClick() {
    if (this.refPrePicksAccordion) {
      if (this.refPrePicksAccordion.classList.contains('open')) {
        this.refPrePicksAccordion.className = this.refPrePicksAccordion.className.replace(
          ' open',
          ''
        )
        this.accordionToggle = TweenMax.to(this.refPrePicksAccordion, 0.3, {
          x: '-93.5%',
        })
        //clearTimeout(this.accordionTimeout)

        //ROTATE ARROW
        if (this.refArrowIcon) {
          TweenMax.to(this.refArrowIcon, 0.4, { rotation: 0 })
        }

        //CLOSE PREVIEW
        if (this.isShownDraggablePreview) {
          this.draggablePreviewValue = null
          this.isShownDraggablePreview = false
          this.forceUpdate()
        }
      } else {
        this.refPrePicksAccordion.className += ' open'
        this.accordionToggle = TweenMax.to(this.refPrePicksAccordion, 0.3, {
          x: '0%',
        })
        /*
        this.accordionTimeout = setTimeout(() => {
          this.refPrePicksAccordion.className = this.refPrePicksAccordion.className.replace(' open', '')
          this.accordionToggle.reverse()

          if (this.refArrowIcon) {
            TweenMax.to(this.refArrowIcon, 0.4, {rotation:0})
          }
        }, 10000)
*/

        //ROTATE ARROW
        if (this.refArrowIcon) {
          TweenMax.to(this.refArrowIcon, 0.4, { rotation: 180 })
        }
      }
    }
  }

  // handleAddTeamClick() {
  //   this.props.GameEventStore.incrementTeamCount().then(cnt => {
  //     let participant = {
  //       id: cnt,
  //       name: '',
  //       initial: '',
  //       topColor: '#000000',
  //       bottomColor: '#414042',
  //       showTopColorPicker: false,
  //       showBottomColorPicker: false,
  //     }
  //     this.props.GameEventStore.values.participants.push(participant)
  //   })
  // }

  handleDrag(e) {
    const leftLimit = e.clientX + e.target.offsetWidth
    console.log(window.innerWidth, leftLimit, e)

    if (leftLimit >= window.innerWidth) {
      //      e.screenX = (window.innerWidth - e.target.offsetWidth)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.confirmModal !== nextState.confirmModal) {
      return true
    }
    if (this.state.isUpdating !== nextState.isUpdating) {
      return true
    }
    if (this.state.stage !== nextState.stage) {
      return true
    }
    if (this.state.showPage !== nextState.showPage) {
      return true
    }
    if (this.state.errorComponent !== nextState.errorComponent) {
      return true
    }
    if (this.state.showErrorPage !== nextState.showErrorPage) {
      return true
    }
    if (this.state.overlayMessage !== nextState.overlayMessage) {
      return true
    }
    if (this.state.sportType !== nextState.sportType) {
      return true
    }
    return false
  }

  componentWillUnmount() {
    this._isMounted = false
    this.destroyUpdating()
    this.destroySportType()
    this.destroySponsorList()
    clearTimeout(this.accordionTimeout)
    clearTimeout(this.TimeoutErrorMessage)
  }

  saveValuesBeforeReloadPage() {
    if (!this.isExitPage) {
      try {
        sessionStorage.setItem(
          'EVENT_VALUES',
          JSON.stringify(this.props.GameEventStore.values)
        )
      } catch (e) {}
    }
  }

  componentDidMount() {
    this._isMounted = true
    this.setState({ stage: this.props.GameEventStore.values.stage })

    if (this.props.GameEventStore.values.gameId) {
      this.props.GameEventStore.readGameById(
        this.props.GameEventStore.values.gameId
      )
        .then(next => {
          if (next) {
            this.setState({ showPage: true, showErrorPage: false })
          }
        })
        .catch(err => {
          this.setState({ showPage: true, showErrorPage: true })
        })
    } else {
      this.props.GameEventStore.readGameEventInfo()
        .then(next => {
          if (next) {
            this.setState({ showPage: true, showErrorPage: false })
          }
        })
        .catch(err => {
          this.setState({ showPage: true, showErrorPage: true })
        })
    }

    window.addEventListener(
      'beforeunload',
      this.saveValuesBeforeReloadPage.bind(this)
    )
  }

  render() {
    if (!this.state.showPage) {
      return (
        <Container>
          <FetchingIndicator>
            <ActivityIndicator color={'#ffffff'} height={5} />
          </FetchingIndicator>
        </Container>
      )
    }

    if (this.state.showErrorPage) {
      return (
        <Container>
          <ServerError />
        </Container>
      )
    }

    let { GameEventStore, OperatorStore } = this.props
    let Stack = !GameEventStore.values.stage ? DetailCreating : DetailEditing
    const createButtonIcon = GameEventStore.values.stage
      ? this.state.isUpdating
        ? SaveIcon
        : ExitEventIcon
      : SaveIcon
    const createButtonStyle = GameEventStore.values.stage
      ? this.state.isUpdating
        ? { transform: 'rotate(0deg)' }
        : { transform: 'rotate(90deg)' }
      : { transform: 'rotate(180deg)' }

    return (
      <Container>
        <Content>
          {this.state.errorComponent}

          <DetailsPanel>
            <Stack importPlaystack={this.handleImportPlaystack.bind(this)} />
          </DetailsPanel>

          {GameEventStore.values.stage === 'live' ? (
            <CommonPanel>
              <PrePicksAccordion
                innerRef={ref => (this.refPrePicksAccordion = ref)}
              >
                <LivePrePicksPanel>
                  <Section marginTop={2} justifyContent="space-between">
                    <Label
                      font={'pamainbold'}
                      size={1.9}
                      color={'#939598'}
                      uppercase
                      nowrap
                    >
                      prepicks
                    </Label>
                    <ButtonGroup>
                      <PreviewButton
                        backgroundColor={
                          this.isShownDraggablePreview ? '#008000' : '#c61818'
                        }
                        onClick={this.handleShowPreviewClick.bind(this)}
                      />
                    </ButtonGroup>
                  </Section>
                  <Section marginTop={0.5}>
                    <PrePicks
                      showErrorMessage={this.handleShowErrorMessage.bind(this)}
                      refPrePickItemFocus={this.handlePrePickItemFocus.bind(
                        this
                      )}
                      refUpdatedPrePickInfo={this.handleUpdatedPrePickInfo.bind(
                        this
                      )}
                    />
                  </Section>
                </LivePrePicksPanel>
                <AccordionButton
                  onClick={this.handleAccordionButtonClick.bind(this)}
                >
                  <ArrowIcon innerRef={ref => (this.refArrowIcon = ref)} />
                </AccordionButton>
              </PrePicksAccordion>
              <BlankPanel widthInPct={5} />
              <LiveSponsorsPanel>
                <LiveStats
                  height={h}
                  showErrorMessage={this.handleShowErrorMessage.bind(this)}
                />
              </LiveSponsorsPanel>

              {/*
               */}
            </CommonPanel>
          ) : (
            <CommonPanel>
              <PrePicksPanel>
                <Section marginTop={2} justifyContent="space-between">
                  <Label
                    font={'pamainbold'}
                    size={1.9}
                    color={'#939598'}
                    uppercase
                    nowrap
                  >
                    prepicks
                  </Label>
                  <ButtonGroup>
                    {GameEventStore.values.sportType &&
                    GameEventStore.values.sportType.id ? (
                      GameEventStore.leap && GameEventStore.leap.isLeap ? (
                        <PresetButton
                          onClick={this.handleLoadPresetClick.bind(this)}
                        />
                      ) : GameEventStore.values.stage === 'pregame' ||
                        GameEventStore.values.stage === 'pending' ||
                        GameEventStore.values.stage === 'live' ? null : (
                        <PresetButton
                          onClick={this.handleLoadPresetClick.bind(this)}
                        />
                      )
                    ) : null}
                    <PreviewButton
                      backgroundColor={
                        this.isShownDraggablePreview ? '#008000' : '#c61818'
                      }
                      onClick={this.handleShowPreviewClick.bind(this)}
                    />
                  </ButtonGroup>
                </Section>
                <Section marginTop={0.5}>
                  <PrePicks
                    showErrorMessage={this.handleShowErrorMessage.bind(this)}
                    refPrePickItemFocus={this.handlePrePickItemFocus.bind(this)}
                    refUpdatedPrePickInfo={this.handleUpdatedPrePickInfo.bind(
                      this
                    )}
                  />
                </Section>
              </PrePicksPanel>
              <SponsorsPanel>
                <FlagshipWrap>
                  <FlagshipContent>
                    <Section marginTop={2} marginBottom={0.5}>
                      <Label
                        font={'pamainbold'}
                        size={1.8}
                        color={'#ffffff'}
                        uppercase
                        nowrap
                      >
                        flagship sponsor
                      </Label>
                    </Section>
                    {/*<SponsorItem*/}
                    {/*  item={this.props.PrePlayStore.sponsors[0]}*/}
                    {/*  width={24}*/}
                    {/*  height={GameEventStore.baseHeight}*/}
                    {/*/>*/}

                    {this.props.PrePlayStore.sponsors &&
                    this.props.PrePlayStore.sponsors.length > 0 ? (
                      <SponsorItem
                        item={this.props.PrePlayStore.sponsors[0]}
                        width={24}
                        height={GameEventStore.baseHeight}
                      />
                    ) : null}
                  </FlagshipContent>
                </FlagshipWrap>
                <SelectedWrap>
                  <SelectedContent>
                    <Section marginTop={1} marginBottom={1}>
                      <Label
                        font={'pamainbold'}
                        size={1.8}
                        color={'#939598'}
                        uppercase
                        nowrap
                      >
                        selected sponsors
                      </Label>
                    </Section>
                    {GameEventStore.availableSponsors.map((sponsor, idx) => {
                      const s = this.props.PrePlayStore.sponsors.filter(
                        o => o.id === sponsor.id
                      )[0]
                      if (!s) {
                        return null
                      }
                      return (
                        <SponsorItemWrap key={`${s.id}- ${idx}`}>
                          <SponsorItem
                            item={s}
                            width={24}
                            height={GameEventStore.baseHeight}
                            inactive={!sponsor.selected}
                          />
                        </SponsorItemWrap>
                      )
                    })}
                  </SelectedContent>
                </SelectedWrap>
              </SponsorsPanel>
            </CommonPanel>
          )}
        </Content>

        <Footer>
          <CurrentUserWrap>
            {/*<CurrentUser text={'admin user - executive producer'}></CurrentUser>*/}
            <CurrentUser
              text={`${OperatorStore.operator.firstName} ${OperatorStore.operator.lastName} - ${OperatorStore.operator.groupName}`}
            ></CurrentUser>
            <ThisImage src={ProfileDefaultIcon} />
          </CurrentUserWrap>
          <CreateGameEventButton
            width={GameEventStore.values.stage === 'live' ? 72 : 57}
            backgroundColor={
              GameEventStore.values.stage
                ? this.state.isUpdating
                  ? '#18c5ff'
                  : '#414042'
                : '#18c5ff'
            }
            color={
              GameEventStore.values.stage
                ? this.state.isUpdating
                  ? '#000000'
                  : '#ffffff'
                : '#000000'
            }
            text={
              GameEventStore.values.stage
                ? this.state.isUpdating
                  ? 'update details'
                  : 'exit event details'
                : 'save event session'
            }
            onClick={
              GameEventStore.values.stage
                ? this.state.isUpdating
                  ? this.handleUpdateEventClick.bind(this)
                  : this.handleExitEventClick.bind(this)
                : this.handleSaveEventClick.bind(this)
            }
          >
            &nbsp;&nbsp;
            <img
              height={vhToPx(3.5)}
              src={createButtonIcon}
              style={createButtonStyle}
            />
          </CreateGameEventButton>
          {!GameEventStore.values.stage ? (
            <ExitButton
              onClick={this.handleExitEventClick.bind(this)}
              innerRef={ref => (this.refPreviewLocationGuide = ref)}
            />
          ) : GameEventStore.values.stage === 'live' ? (
            <ExitButton
              onClick={this.handleExitEventClick.bind(this)}
              innerRef={ref => (this.refPreviewLocationGuide = ref)}
            />
          ) : (
            /*
              <CancelGameEventButon
                isEditing={GameEventStore.values.stage ? true : false}
                onClick={GameEventStore.values.stage ? this.handleCancelEventClick.bind(this) : null}
                innerRef={ref => this.refPreviewLocationGuide = ref}
              >
                {GameEventStore.values.stage ? 'cancel game event?' : null}
              </CancelGameEventButon>
*/
            <ExitButton
              onClick={this.handleExitEventClick.bind(this)}
              innerRef={ref => (this.refPreviewLocationGuide = ref)}
            />
          )}
        </Footer>

        {this.state.overlayMessage}
        {this.state.confirmModal}

        {this.isShownDraggablePreview ? (
          <Preview
            size={this.containerSize}
            values={this.props.GameEventStore.values}
            question={this.draggablePreviewValue}
          />
        ) : null}
      </Container>
    )
  }
}

const DragContainer = styled.div`
  width: 30vh;
  height: 20vh;
  background-color: red;
`

let h = 5
const Container = styled.div`
  width: ${props => vwToPx(100)};
  height: ${props => vhToPx(100)};
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #f2f2f2;
  overflow: hidden;
`

const Content = styled.div`
  width: 100%;
  height: ${props => vhToPx(95)};
  display: flex;
  justify-content: space-between;
`

const DetailsPanel = styled.div`
  width: 28%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const PrePicksPanel = styled.div`
  /*
  width: 57%;
*/
  width: 79%;
  height: 100%;
  position: relative;
  padding: 0 1.5% 0 0.5%;
`

const SponsorsPanel = styled.div`
  width: 21%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  background-color: #212121;

  overflow-x: hidden;
  overflow-y: scroll;
`

const FlagshipWrap = styled.div`
  width: 100%;
  height: ${props => vhToPx(12)};
  background-color: ${props => props.backgroundColor || '#495bdb'};
  display: flex;
  justify-content: center;
`

const FlagshipContent = styled.div`
  height: 100%;
`

const SelectedWrap = styled.div`
  width: 100%;
  height: auto !important;
  min-height: 100%;
  //padding-left: 9%;
  display: flex;
  flex-direction: column;
  align-items: center;

  ///////position: absolute;
`

const SelectedContent = styled.div``

const Footer = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
`

const CurrentUserWrap = styled.div`
  width: 28%;
  height: 100%;
  background-color: #939598;
  display: flex;
  justify-content: space-between;
`

const CurrentUser = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: ${props => vhToPx(2)};
  &:after {
    content: '${props => props.text}';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx(h * 0.4 * 0.75)};
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
  }
`

const CreateGameEventButton = styled.div`
  width: ${props => props.width || 57}%;
  height: 100%;
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center
  font-family: pamainbold;
  font-size: ${props => vhToPx(2.8)};
  color: ${props => props.color};
  text-transform: uppercase;
  padding-top: ${props => vhToPx(0.5)};
  cursor: pointer;
  &:before {
    content: '${props => props.text}';
  }
`

const ExitButton = styled.div`
  width: 15.15%;
  height: 100%;
  background-color: #c61818; /*#414042;*/
  display: flex;
  justify-content: center;
  align-items: center
  flex-direction: row;
  cursor: pointer;
  &:before {
    content: 'exit';
    font-family: pamainbold;
    font-size: ${props => vhToPx(2.8)};
    color: #ffffff;
    text-transform: uppercase;
    line-height: 1;
    height: ${props => vhToPx(2.8 * 0.8)};
  }
  &:after {
    content: '';
    display: inline-block;
    width: inherit;
    height: inherit;
    background-image: url(${ExitEventIcon});
    background-repeat: no-repeat;
    background-size: 60%;
    background-position: center;
    transform: rotate(90deg);
  }
`

const CancelGameEventButon = styled.div`
  width: 15.15%;
  height: 100%;
  background-color: ${props => (props.isEditing ? '#939598' : '#18c5ff')};
  font-family: pamainregular;
  font-size: ${props => vhToPx(2.3)};
  color: #ffffff;
  text-transform: uppercase;
  padding-top: ${props => vhToPx(0.5)};
  display: flex;
  justify-content: center;
  align-items: center
  cursor: ${props => (props.isEditing ? 'pointer' : 'default')};
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

const ErrorComponent = styled.div`
  width: 27%;
  display: block;
  position: absolute;
  z-index: 300;
  opacity: 1;
  padding: 1% 0.5% 0 1.5%;
`

const ErrorComponentInner = styled.div`
  width: 100%;
  background-color: #f0ad4e;
  border-radius: ${props => vhToPx(0.3)};
`

const ECWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const ECCloseButton = styled.div`
  font-family: pamainlight;
  font-size: ${props => vhToPx(3)};
  color: #ececec;
  display: flex;
  align-self: flex-end;
  margin-right: ${props => vhToPx(1.5)};
  transform: scaleX(2);
  cursor: pointer;
`

const ECMessage = styled.div`
  font-family: pamainregular;
  font-size: ${props => vhToPx(2.5)};
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: ${props => vhToPx(0.2)};
  padding: ${props => vhToPx(2)};
  margin-top: -10%;
`

const SponsorItemWrap = styled.div`
  display: flex;
  margin-bottom: ${props => vhToPx(0.3)};
`

const ThisImage = styled.div`
  width: ${props => vhToPx(h)};
  height: ${props => vhToPx(h)};
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-size: 80%;
  background-position: center;
  margin-right: ${props => vhToPx(2)};
`

const CommonPanel = styled.div`
  position: relative;
  width: 72%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`

const PrePicksAccordion = styled.div`
  position: absolute;
  width: 83%;
  height: 100%;
  display: flex;
  flex-direction: row;
  transform: translateX(-93.5%);
  background-color: #f2f2f2;
  z-index: 100;
`

const AccordionButton = styled.div`
  width: 7%;
  height: 100%;
  background-color: #22ba2c;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:before {
    content: 'prepicks';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.35)};
    color: #ffffff;
    line-height: 1;
    text-transform: uppercase;
    writing-mode: vertical-lr;
    text-orientation: upright;
  }
`

const ArrowIcon = styled.div`
  margin-top: ${props => vhToPx(2)};
  width: ${props => vhToPx(4)};
  height: ${props => vhToPx(4)};
  background-image: url(${evalImage(`icon-arrow.svg`)});
  background-repeat: no-repeat;
  background-position: center;
  background-size: 50%;
`

const LivePrePicksPanel = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 0.5% 0 0.5%;
`

const BlankPanel = styled.div`
  width: ${props => props.widthInPct}%;
  height: 100%;
`

const LiveSponsorsPanel = styled.div`
  width: 95%;
  height: 100%;

  overflow-y: scroll;
  overflow-x: hidden;

  position: relative;
`

const LiveSponsorsContent = styled.div`
  width: 100%;
  height: auto !important;
  min-height: 100%;
  display: flex;
  flex-direction: row;
  position: absolute;
`

const LiveSponsorItemWrap = styled.div`
  display: flex;
  margin-bottom: ${props => vhToPx(3)};
  //padding: ${props => vhToPx(1.5)} 0;
  //height: ${props => vhToPx(8)};
`

const LiveSponsorsInner = styled.div`
  width: 22%;
  background-color: #212121;
  display: flex;
  flex-direction: column;
`

const LiveSelectedWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const LiveStatsWrap = styled.div`
  width: ${props => (props.widthInPct ? `${props.widthInPct}%` : `auto`)};
  background-color: ${props => props.backgroundColor};
  display: flex;
  flex-direction: column;
`

const LiveStatsContent = styled.div`
  width: 100%;
  height: ${props => (props.height ? vhToPx(props.height) : 'auto')};
  ${props =>
    props.borderColor
      ? `border-bottom: ${vhToPx(0.2)} solid ${props.borderColor};`
      : ''};
  display: flex;
  flex-direction: column;
`

const LiveStatsRowLabel = styled.div`
  width: 100%;
  height: ${props => vhToPx(4.4)};
  display: flex;
  flex-direction: row;
  padding-top: ${props => vhToPx(1)};
`

const LiveStatsRow = styled.div`
  width: 100%;
  height: ${props => vhToPx(props.height)};
  margin-bottom: ${props => vhToPx(3)};
  display: flex;
  flex-direction: row;
`

const LiveStatsCell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  //padding-left: ${props => vhToPx(props.paddingLeft || 3)};
  padding-left: ${props => props.paddingLeft || 5}%;
`

const LiveStatsLabelFraction = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  &:before {
    content: '${props => addCommas(props.text.toString().split('/')[0])}';
    font-family: ${props => props.fontBefore};
    font-size: ${props => vhToPx(props.sizeBefore)};
    height: ${props => vhToPx(props.sizeBefore * 0.9)};
    color: ${props => props.colorBefore || '#000000'};
    line-height: 1;
  }
  &:after {
    content: '${props =>
      props.text.toString().split('/')[1]
        ? props.spaceBetween
          ? `\00a0/ ${addCommas(props.text.toString().split('/')[1])}`
          : `/${addCommas(props.text.toString().split('/')[1])}`
        : null}
    ';
    font-family: ${props => props.fontAfter};
    font-size: ${props => vhToPx(props.sizeAfter)};
    height: ${props => vhToPx(props.sizeAfter * 0.9)};
    color: ${props => props.colorAfter || '#000000'};
    line-height: 1;
  }
`

const LiveStatsGoalIcon = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 40%;
    background-position: center;
  }
`

const LiveStatsLabel = styled.span`
  font-family: ${props => props.font || 'pamainregular'};
  font-size: ${props => vhToPx(props.size || 3)};
  color: ${props => props.color || '#000000'};
  line-height: 1;
  props.italic ? 'font-style: italic;' : ''};
  white-space: nowrap;
`

const FetchingIndicator = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${props => props.backgroundColor || '#222222'};
  position: absolute;
  z-index: ${props => props.zIndex || 100};
  display: flex;
  justify-content: center;
  align-items: center;
  &:after {
    content: '${props => props.text || 'fetching required data'}';
    font-family: pamainregular;
    font-size: ${props => vhToPx(2.5)};
    color: #ffffff;
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.1)};
  }
`

const ShowHidePreview = styled.div`
  cursor: pointer;
  &:after {
    content: '${props => props.text}';
    font-family: pamainextrabold;
    font-size: ${props => vhToPx(1.4)};
    color: ${props => props.color};
    line-height: 1;
    height: ${props => vhToPx(1.4 * 0.8)};
    text-transform: uppercase;
  }
`

const ButtonGroup = styled.div`
  height: ${props => vhToPx(3)};
  display: flex;
  flex-direction: row;
`

const PreviewButton = styled.div`
  width: ${props => vhToPx(3)};
  min-width: ${props => vhToPx(3)};
  height: ${props => vhToPx(3)};
  background-image: url(${PreviewIcon});
  background-repeat: no-repeat;
  background-size: 70%;
  background-position: center;
  background-color: ${props => props.backgroundColor};
  cursor: pointer;
`

const PresetButton = styled.div`
  height: ${props => vhToPx(3)};
  background-color: #0fbc1c;
  margin-right: ${props => vhToPx(1)};
  display: flex;
  align-items: center;
  cursor: pointer;
  &:after {
    content: 'load prepicks';
    font-family: pamainregular;
    font-size: ${props => vhToPx(1.4)};
    color: #ffffff;
    line-height: 1;
    height: ${props => vhToPx(1.4 * 0.8)};
    text-transform: uppercase;
    letter-spacing: ${props => vhToPx(0.2)};
    padding: ${props => `0 ${vhToPx(2)} 0 ${vhToPx(2)}`};
  }
`
