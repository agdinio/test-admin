import React, { Component } from 'react'
import styled from 'styled-components'
import { inject, observer } from 'mobx-react'
import { vhToPx, vwToPx, isEqual, evalImage, guid, addCommas } from '@/utils'
import SponsorItem from '@/Components/Common/SponsorItem'
import CheckIcon from '@/assets/images/icon-live-stats-goal.svg'
let h = 0

@inject('GameEventStore', 'PrePlayStore')
export default class LiveStats extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
  }

  render() {
    let { GameEventStore } = this.props

    let sponsorStats = null
    if (GameEventStore.values.stage === 'live') {
      sponsorStats = GameEventStore.availableSponsors
        .filter(o => o.selected)
        .sort((a, b) => a.sequence > b.sequence)
    }

    return (
      <Container>
        <LiveSponsorsContent>
          <LiveSponsorsInner>
            <FlagshipWrap backgroundColor="#414042">
              <FlagshipContent>
                <Section marginTop={2} marginBottom={1}>
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
                <SponsorItem
                  item={this.props.PrePlayStore.sponsors[0]}
                  width={24}
                  height={GameEventStore.baseHeight}
                />
              </FlagshipContent>
            </FlagshipWrap>
            <LiveSelectedWrap>
              <SelectedContent>
                <Section marginTop={1} marginBottom={1.2}>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#ffffff'}
                    uppercase
                    nowrap
                  >
                    selected sponsors
                  </Label>
                </Section>
                {sponsorStats.map((sponsor, idx) => {
                  const s = this.props.PrePlayStore.sponsors.filter(
                    o => o.id === sponsor.id
                  )[0]
                  if (!s) {
                    return null
                  }
                  return (
                    <LiveSponsorItemWrap key={`${s.id}- ${idx}`}>
                      <SponsorItem
                        key={`${s.id}- ${idx}`}
                        item={s}
                        width={24}
                        height={GameEventStore.baseHeight}
                        inactive={!sponsor.selected}
                      />
                    </LiveSponsorItemWrap>
                  )
                })}
              </SelectedContent>
            </LiveSelectedWrap>
          </LiveSponsorsInner>
          <LiveStatsWrap widthInPct="15" backgroundColor="#e6e7e8">
            <LiveStatsContent height="12" borderColor="#414042">
              <LiveStatsRowLabel>
                <LiveStatsCell paddingLeft="15">
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#939598'}
                    uppercase
                    nowrap
                  >
                    panels
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#939598'}
                    uppercase
                    nowrap
                  >
                    viewed
                  </Label>
                </LiveStatsCell>
              </LiveStatsRowLabel>
              <LiveStatsRow key={0} height={GameEventStore.baseHeight}>
                <LiveStatsCell paddingLeft="15">
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.panels.big}
                    fontBefore="pamainregular"
                    sizeBefore="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.panels.small}
                    fontBefore="pamainbold"
                    sizeBefore="1.9"
                  />
                </LiveStatsCell>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.viewed.big}
                    fontBefore="pamainlight"
                    sizeBefore="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.viewed.small}
                    fontBefore="pamainbold"
                    sizeBefore="1.9"
                  />
                </LiveStatsCell>
              </LiveStatsRow>
            </LiveStatsContent>
            <LiveStatsContent>
              <div style={{ width: '100%', height: vhToPx(3.6) }} />
              {sponsorStats.map(item => {
                return (
                  <LiveStatsRow
                    key={item.sequence}
                    height={GameEventStore.baseHeight}
                  >
                    <LiveStatsCell paddingLeft="15">
                      <LiveStatsLabelFraction
                        text={item.panels.big}
                        fontBefore="pamainregular"
                        sizeBefore="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.panels.small}
                        fontBefore="pamainbold"
                        sizeBefore="1.9"
                      />
                    </LiveStatsCell>
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.viewed.big}
                        fontBefore="pamainlight"
                        sizeBefore="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.viewed.small}
                        fontBefore="pamainbold"
                        sizeBefore="1.9"
                      />
                    </LiveStatsCell>
                  </LiveStatsRow>
                )
              })}
            </LiveStatsContent>
          </LiveStatsWrap>
          <LiveStatsWrap widthInPct="63" backgroundColor="#ffffff">
            <LiveStatsContent
              height="12"
              borderColor="#414042"
              style={{ paddingLeft: '3%' }}
            >
              {/*xxx 2*/}
              <LiveStatsRowLabel>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#c61818'}
                    uppercase
                    nowrap
                  >
                    lp
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#19d1bf'}
                    uppercase
                    nowrap
                  >
                    gm
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#495bdb'}
                    uppercase
                    nowrap
                  >
                    sp
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#495bdb'}
                    uppercase
                    nowrap
                  >
                    vd
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#9368AA'}
                    uppercase
                    nowrap
                  >
                    pr
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell widthInPct="70">
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#CCB300'}
                    uppercase
                    nowrap
                  >
                    str
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell>
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#000000'}
                    uppercase
                    nowrap
                  >
                    ann.
                  </Label>
                </LiveStatsCell>
                <LiveStatsCell widthInPct="50">
                  <Label
                    font={'pamainbold'}
                    size={1.8}
                    color={'#000000'}
                    uppercase
                    nowrap
                  >
                    goal
                  </Label>
                </LiveStatsCell>
              </LiveStatsRowLabel>
              <LiveStatsRow key={1000} height={GameEventStore.baseHeight}>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.lp.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.lp.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    colorBefore="#c61818"
                    colorAfter="#c61818"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.gm.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.gm.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    colorBefore="#19d1bf"
                    colorAfter="#19d1bf"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.sp.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.sp.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    colorBefore="#495bdb"
                    colorAfter="#495bdb"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.vd.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.vd.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    colorBefore="#495bdb"
                    colorAfter="#495bdb"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.pr.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.pr.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    colorBefore="#9368aa"
                    colorAfter="#9368aa"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell widthInPct="70">
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.str.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.str.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    colorBefore="#CCB300"
                    colorAfter="#CCB300"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell>
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.ann.big || '---'}
                    fontBefore="pamainregular"
                    fontAfter="pamainlight"
                    sizeBefore="3.2"
                    sizeAfter="3.2"
                  />
                  <LiveStatsLabelFraction
                    text={GameEventStore.flagshipSponsor.ann.small || '---'}
                    fontBefore="pamainbold"
                    fontAfter="pamainbold"
                    sizeBefore="1.9"
                    sizeAfter="1.9"
                    spaceBetween
                  />
                </LiveStatsCell>
                <LiveStatsCell widthInPct="50">
                  <LiveStatsGoalIcon src={CheckIcon} />
                </LiveStatsCell>
              </LiveStatsRow>
            </LiveStatsContent>
            <LiveStatsContent style={{ paddingLeft: '3%' }}>
              <div style={{ width: '100%', height: vhToPx(3.6) }} />
              {sponsorStats.map(item => {
                return (
                  <LiveStatsRow
                    key={item.sequence}
                    height={GameEventStore.baseHeight}
                  >
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.lp.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.lp.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        colorBefore="#c61818"
                        colorAfter="#c61818"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.gm.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.gm.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        colorBefore="#19d1bf"
                        colorAfter="#19d1bf"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.sp.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.sp.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        colorBefore="#495bdb"
                        colorAfter="#495bdb"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.vd.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.vd.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        colorBefore="#495bdb"
                        colorAfter="#495bdb"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.pr.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.pr.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        colorBefore="#9368aa"
                        colorAfter="#9368aa"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell widthInPct="70">
                      <LiveStatsLabelFraction
                        text={item.str.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.str.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        colorBefore="#CCB300"
                        colorAfter="#CCB300"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell>
                      <LiveStatsLabelFraction
                        text={item.ann.big || '---'}
                        fontBefore="pamainregular"
                        fontAfter="pamainlight"
                        sizeBefore="3.2"
                        sizeAfter="3.2"
                      />
                      <LiveStatsLabelFraction
                        text={item.ann.small || '---'}
                        fontBefore="pamainbold"
                        fontAfter="pamainbold"
                        sizeBefore="1.9"
                        sizeAfter="1.9"
                        spaceBetween
                      />
                    </LiveStatsCell>
                    <LiveStatsCell widthInPct="50">
                      <LiveStatsGoalIcon src={CheckIcon} />
                    </LiveStatsCell>
                  </LiveStatsRow>
                )
              })}
            </LiveStatsContent>
          </LiveStatsWrap>
        </LiveSponsorsContent>
      </Container>
    )
  }
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
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

const LiveSponsorsContent = styled.div`
  width: 100%;
  height: auto !important;
  min-height: 100%;
  display: flex;
  flex-direction: row;
  position: absolute;
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

const LiveSponsorItemWrap = styled.div`
  display: flex;
  margin-bottom: ${props => vhToPx(3)};
  //padding: ${props => vhToPx(1.5)} 0;
  //height: ${props => vhToPx(8)};
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

const SelectedContent = styled.div``

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
  width: ${props => props.widthInPct || 100}%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  //padding-left: ${props => vhToPx(props.paddingLeft || 3)};
  padding-left: ${props => props.paddingLeft || 0}%;
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
    background-size: 60%;
    margin-top: 20%;
  }
`
