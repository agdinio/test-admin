import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { vhToPx, vwToPx, isEqual, evalImage } from '@/utils'
import dateFormat from 'dateformat'
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays'
import subDays from 'date-fns/subDays'
import NavIcon from '@/assets/images/icon-calendar-arrow.svg'

export default class EditingCalendar extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      dates: {
        dateStart: new Date(this.props.dates.dateStart),
        dateAnnounce: new Date(this.props.dates.dateAnnounce),
        datePrePicks: new Date(this.props.dates.datePrePicks),
      },
    })

    this.today = new Date()
    this.currentMonth = this.today.getMonth()
    this.currentYear = this.today.getFullYear()
    this.selectedDate = this.props.dateRangeSelectable.end
  }

  handleNavLeftClick() {
    this.currentYear =
      this.currentMonth === 0 ? this.currentYear - 1 : this.currentYear
    this.currentMonth = this.currentMonth === 0 ? 11 : this.currentMonth - 1
    this.showCalendar(this.currentMonth, this.currentYear)
  }

  handleNavRightClick() {
    this.currentYear =
      this.currentMonth === 11 ? this.currentYear + 1 : this.currentYear
    this.currentMonth = (this.currentMonth + 1) % 12
    this.showCalendar(this.currentMonth, this.currentYear)
  }

  handleMouseOver(cell) {
    cell.style.transition = 'all 0.075s ease-in'
    cell.style.transform = 'scale(1.2)'
    cell.style.backgroundColor = this.props.hoverColor
  }

  handleMouseOut(cell) {
    cell.style.transition = 'all 0.075s ease-in'
    cell.style.transform = 'scale(1)'
    cell.style.backgroundColor = cell.dataset.defaultBackgroundColor
  }

  changeSelectedDate(cell) {
    cell.style.backgroundColor = this.props.hoverColor
    cell.dataset.defaultBackgroundColor = this.props.hoverColor

    let tbl = document.getElementById('days-body') // body of the calendar

    for (let x = 0; x < tbl.childNodes.length; x++) {
      const _row = tbl.childNodes[x]
      for (let y = 0; y < _row.childNodes.length; y++) {
        const _cell = _row.childNodes[y]
        const _ellDatasetDate = new Date(_cell.dataset.day)
        if (
          _ellDatasetDate.getFullYear() === this.selectedDate.getFullYear() &&
          _ellDatasetDate.getMonth() === this.selectedDate.getMonth() &&
          _ellDatasetDate.getDate() === this.selectedDate.getDate()
        ) {
          _cell.style.backgroundColor = '#000000'
          _cell.dataset.defaultBackgroundColor = '#000000'
          break
        }
      }
    }

    console.log('=>', cell.dataset.day)

    this.selectedDate = new Date(cell.dataset.day)
    if (this.props.dateUpdated) {
      this.props.dateUpdated({
        dateType: this.props.dateType,
        date: this.selectedDate,
      })
    }

    if (this.props.datePrepareUpdate) {
      this.props.datePrepareUpdate({
        dateType: this.props.dateType,
        date: this.selectedDate,
      })
    }
  }

  showCalendar(month, year) {
    let { today } = this

    let highlightedDates = [
      { date: this.dates.dateStart, backgroundColor: '#c61818' },
      {
        date:
          this.props.dateType == 'datePrePicks'
            ? this.selectedDate
            : this.dates.datePrePicks,
        backgroundColor: '#0fbc1c',
      },
      {
        date:
          this.props.dateType == 'dateAnnounce'
            ? this.selectedDate
            : this.dates.dateAnnounce,
        backgroundColor: '#18c5ff',
      },
    ]

    let enabledDates = [
      {
        date:
          this.props.dateType == 'datePrePicks'
            ? this.selectedDate
            : this.dates.datePrePicks,
      },
      {
        date:
          this.props.dateType == 'dateAnnounce'
            ? this.selectedDate
            : this.dates.dateAnnounce,
      },
    ]

    const start = this.props.dateRangeSelectable.start
    const end = this.props.dateRangeSelectable.end
    const diff = differenceInCalendarDays(end, start)
    for (let i = 0; i <= diff; i++) {
      const dateToPush = subDays(end, i)
      const idx = highlightedDates.findIndex(
        o =>
          o.date.getFullYear() === dateToPush.getFullYear() &&
          o.date.getMonth() === dateToPush.getMonth() &&
          o.date.getDate() === dateToPush.getDate()
      )
      if (idx < 0) {
        highlightedDates.push({ date: dateToPush, backgroundColor: '#000000' })
        enabledDates.push({ date: dateToPush })
      }
    }

    // FOR DATEANNOUNCE
    const diffDateAnnounce = differenceInCalendarDays(
      this.dates.datePrePicks,
      this.dates.dateAnnounce
    )
    for (let j = 0; j < diffDateAnnounce; j++) {
      const dateToPush = subDays(this.dates.datePrePicks, j)
      const idx = highlightedDates.findIndex(
        o =>
          o.date.getFullYear() === dateToPush.getFullYear() &&
          o.date.getMonth() === dateToPush.getMonth() &&
          o.date.getDate() === dateToPush.getDate()
      )
      if (idx < 0) {
        highlightedDates.push({ date: dateToPush, backgroundColor: '#000000' })
        enabledDates.push({ date: dateToPush })
      }
    }

    if (this.props.dateRangeSelectable.isAfterEndDateSelectable) {
      const diffAfter = differenceInCalendarDays(
        this.dates.dateStart,
        this.props.dateRangeSelectable.end
      )
      for (let k = 1; k < diffAfter; k++) {
        highlightedDates.push({
          date: subDays(this.dates.dateStart, diffAfter - k),
          backgroundColor: '#000000',
        })
        enabledDates.push({
          date: subDays(this.dates.dateStart, diffAfter - k),
        })
      }
    }

    let container = document.getElementById('container')

    let monthAndYear = document.getElementById('month-and-year')
    monthAndYear.style.height = container.offsetWidth * 0.09 + 'px'
    monthAndYear.style.padding = `0 ${container.offsetWidth * 0.05}px`
    let mymonth = document.getElementById('my-month')
    mymonth.style.cssText = `
      font-family: pamainregular;
      font-size: ${container.offsetWidth * 0.05}px;
      color: #000000;
      text-transform: uppercase;
      margin-right: 3%;
    `
    let myyear = document.getElementById('my-year')
    myyear.style.cssText = `
      font-family: pamainbold;
      font-size: ${container.offsetWidth * 0.05}px;
      color: #000000;
      text-transform: uppercase;
    `

    let datetoday = document.getElementById('date-today')
    datetoday.style.height = container.offsetWidth * 0.09 + 'px'
    datetoday.style.padding = `0 ${container.offsetWidth * 0.05}px`
    let todayislabel = document.getElementById('today-is-label')
    todayislabel.style.cssText = `
      font-family: pamainregular;
      font-size: ${container.offsetWidth * 0.05}px;
      color: #808285;
      text-transform: uppercase;
      margin-right: 3%;
    `
    todayislabel.innerHTML = 'today is:'
    let monthdaylabel = document.getElementById('month-day-label')
    monthdaylabel.style.cssText = `
      font-family: pamainregular;
      font-size: ${container.offsetWidth * 0.05}px;
      color: #000000;
      text-transform: uppercase;
    `
    let yearlabel = document.getElementById('year-label')
    yearlabel.style.cssText = `
      font-family: pamainbold;
      font-size: ${container.offsetWidth * 0.05}px;
      color: #000000;
      text-transform: uppercase;
    `

    let nav = document.getElementById('navigation')
    nav.style.cssText = `
      height: ${container.offsetWidth * 0.07}px;
      padding: 0 ${container.offsetWidth * 0.03}px 0 ${container.offsetWidth *
      0.03}px;
    `
    let navleft = document.getElementById('nav-left')
    navleft.style.cssText = `
      width: ${container.offsetWidth * 0.05}px;
      height: 100%;
      background-image: url(${NavIcon});
      background-repeat: no-repeat;
      background-size: 80%;
      background-position: center;
      cursor: pointer;
    `
    let navRight = document.getElementById('nav-right')
    navRight.style.cssText = `
      width: ${container.offsetWidth * 0.05}px;
      height: 100%;
      background-image: url(${NavIcon});
      background-repeat: no-repeat;
      background-size: 80%;
      background-position: center;
      transform: rotate(180deg);
      cursor: pointer;
    `

    let daysName = document.getElementById('days-name')
    daysName.innerHTML = ''
    daysName.style.cssText = `
      padding: 0 ${container.offsetWidth * 0.05}px 0 ${container.offsetWidth *
      0.05}px;
    `

    let selectYear = document.getElementById('year')
    let selectMonth = document.getElementById('month')

    let months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'Jun',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

    // check how many days in a month code from https://dzone.com/articles/determining-number-days-month
    let daysInMonth = (iMonth, iYear) => {
      return 32 - new Date(iYear, iMonth, 32).getDate()
    }

    let previousMonth = new Date(year, month, 0)
    let previousMonthDay = 0
    let nextMonth = new Date(year, month + 1, 1)
    let nextMonthDay = 1

    let firstDay = new Date(year, month).getDay()

    let tbl = document.getElementById('days-body') // body of the calendar

    // clearing all previous cells
    tbl.innerHTML = ''
    tbl.style.padding = `0 ${container.offsetWidth *
      0.05}px ${container.offsetWidth * 0.02}px ${container.offsetWidth *
      0.05}px`

    // filing data about month and in the page via DOM.
    mymonth.innerHTML = months[month]
    myyear.innerHTML = year
    monthdaylabel.innerHTML = dateFormat(today, 'mm/dd/')
    yearlabel.innerHTML = dateFormat(today, 'yyyy')

    days.forEach((dayname, idx) => {
      const marginRight =
        idx < days.length - 1 ? container.offsetWidth * 0.05 + 'px' : '0'

      const el = document.createElement('div')
      el.style.cssText = `
          width:calc(100%/7);
          font-family: pamainbold;
          font-size: ${container.offsetWidth * 0.05}px;
          color: #D1D3D4;
          text-transform: uppercase;
          display:flex;
          justify-content:center;
          align-items:center;
          margin-right: ${marginRight};
        `
      el.innerHTML = dayname
      daysName.appendChild(el)
    })
    /////////////////////////////////////////////////////////////////////////selectYear.value = year;
    /////////////////////////////////////////////////////////////////////////selectMonth.value = month;

    // creating all cells
    let date = 1
    for (let i = 0; i < 6; i++) {
      // creates a table row
      let row = document.createElement('div')
      row.style.cssText = `display:flex; flex-direction:row; width:100%;margin-bottom:${container.offsetWidth *
        0.02}px;`
      let cell = null
      let cellText = null

      //creating individual cells, filing them up with data.
      for (let j = 0; j < 7; j++) {
        const marginRight = j < 6 ? container.offsetWidth * 0.05 + 'px' : '0'
        const cellHeight = container.offsetWidth * 0.07 + 'px'
        const fontSize = container.offsetWidth * 0.04 + 'px'
        const activeCellStyle = `
            width:calc(100%/7);
            height:${cellHeight};
            background-color:#808285;
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:100;
            color:#ffffff;
            margin-right:${marginRight};
            font-family: pamainregular;
            font-size: ${fontSize};
          `
        const inactiveCellStyle = `
            width:calc(100%/7);
            height:${cellHeight};
            background-color:#D1D3D4;
            display:flex;
            justify-content:center;
            align-items:center;
            z-index:100;
            color:#ffffff;
            margin-right:${marginRight};
            font-family: pamainregular;
            font-size: ${fontSize};
          `

        if (i === 0 && j < firstDay) {
          cell = document.createElement('div')
          cell.style.cssText = inactiveCellStyle
          cell.dataset.day = new Date(
            `${previousMonth.getFullYear()}-${previousMonth.getMonth() +
              1}-${previousMonth.getDate() - previousMonthDay}`
          )
          cellText = document.createTextNode(
            previousMonth.getDate() - previousMonthDay
          )

          //change color
          const currCellDate = new Date(
            `${previousMonth.getFullYear()}-${previousMonth.getMonth() +
              1}-${previousMonth.getDate() - previousMonthDay}`
          )
          const d = highlightedDates.filter(
            o =>
              `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
              `${currCellDate.getFullYear()}-${currCellDate.getMonth()}-${currCellDate.getDate()}`
          )[0]
          if (d) {
            cell.style.backgroundColor = d.backgroundColor
            cell.dataset.defaultBackgroundColor = d.backgroundColor
          }
          //enable
          const ed = enabledDates.filter(
            o =>
              `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
              `${currCellDate.getFullYear()}-${currCellDate.getMonth()}-${currCellDate.getDate()}`
          )[0]
          if (ed) {
            cell.style.cursor = 'pointer'
            cell.addEventListener('click', e => {
              this.changeSelectedDate(e.target)
            })
            cell.addEventListener('mouseover', e => {
              this.handleMouseOver(e.target)
            })
            cell.addEventListener('mouseout', e => {
              this.handleMouseOut(e.target)
            })
          }

          cell.appendChild(cellText)
          row.appendChild(cell)

          for (let i = row.childNodes.length - 1; i >= 0; i--) {
            if (i > row.childNodes.length - 2) {
              row.insertBefore(row.childNodes[i], row.firstChild)
            }
          }

          previousMonthDay++
        } else if (date > daysInMonth(month, year)) {
          if (row.childNodes.length > 0) {
            if (j < 7) {
              cell = document.createElement('div')
              cell.style.cssText = inactiveCellStyle
              cell.dataset.day = new Date(
                `${nextMonth.getFullYear()}-${nextMonth.getMonth() +
                  1}-${nextMonthDay}`
              )
              cellText = document.createTextNode(nextMonthDay)

              //change color
              const currCellDate = new Date(
                `${nextMonth.getFullYear()}-${nextMonth.getMonth() +
                  1}-${nextMonthDay}`
              )
              const d = highlightedDates.filter(
                o =>
                  `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
                  `${currCellDate.getFullYear()}-${currCellDate.getMonth()}-${currCellDate.getDate()}`
              )[0]
              if (d) {
                cell.style.backgroundColor = d.backgroundColor
                cell.dataset.defaultBackgroundColor = d.backgroundColor
              }
              //enable
              const ed = enabledDates.filter(
                o =>
                  `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
                  `${currCellDate.getFullYear()}-${currCellDate.getMonth()}-${currCellDate.getDate()}`
              )[0]
              if (ed) {
                cell.style.cursor = 'pointer'
                cell.addEventListener('click', e => {
                  this.changeSelectedDate(e.target)
                })
                cell.addEventListener('mouseover', e => {
                  this.handleMouseOver(e.target)
                })
                cell.addEventListener('mouseout', e => {
                  this.handleMouseOut(e.target)
                })
              }

              cell.appendChild(cellText)
              row.appendChild(cell)

              nextMonthDay++
            }
          } else {
            break
          }
        } else {
          let d = null
          cell = document.createElement('div')
          cell.style.cssText = activeCellStyle
          cell.dataset.day = new Date(`${year}-${month + 1}-${date}`)
          cellText = document.createTextNode(date)
          if (
            date === today.getDate() &&
            year === today.getFullYear() &&
            month === today.getMonth()
          ) {
            //change color
            d = highlightedDates.filter(
              o =>
                `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
                `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
            )[0]
            if (d) {
              cell.style.backgroundColor = d.backgroundColor
              cell.dataset.defaultBackgroundColor = d.backgroundColor
            } else {
              cell.style.backgroundColor = '#6F8EF5'
              cell.dataset.defaultBackgroundColor = '#6F8EF5'
              cell.style.border = `${container.offsetWidth *
                0.005}px solid #000000`
            }
            //enable
            const ed = enabledDates.filter(
              o =>
                `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
                `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
            )[0]
            if (ed) {
              cell.style.cursor = 'pointer'
              cell.addEventListener('click', e => {
                this.changeSelectedDate(e.target)
              })
              cell.addEventListener('mouseover', e => {
                this.handleMouseOver(e.target)
              })
              cell.addEventListener('mouseout', e => {
                this.handleMouseOut(e.target)
              })
            }
          } else {
            const currCellDate = new Date(`${year}-${month + 1}-${date}`)
            d = highlightedDates.filter(
              o =>
                `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
                `${currCellDate.getFullYear()}-${currCellDate.getMonth()}-${currCellDate.getDate()}`
            )[0]
            if (d) {
              cell.style.backgroundColor = d.backgroundColor
              cell.dataset.defaultBackgroundColor = d.backgroundColor
            }
            const ed = enabledDates.filter(
              o =>
                `${o.date.getFullYear()}-${o.date.getMonth()}-${o.date.getDate()}` ===
                `${currCellDate.getFullYear()}-${currCellDate.getMonth()}-${currCellDate.getDate()}`
            )[0]
            if (ed) {
              cell.style.cursor = 'pointer'
              cell.addEventListener('click', e => {
                this.changeSelectedDate(e.target)
              })
              cell.addEventListener('mouseover', e => {
                this.handleMouseOver(e.target)
              })
              cell.addEventListener('mouseout', e => {
                this.handleMouseOut(e.target)
              })
            }
          }

          cell.appendChild(cellText)
          row.appendChild(cell)
          date++
        }
      }

      tbl.appendChild(row) // appending each row into calendar body.
    }
  }

  componentDidMount() {
    //JUMP TO THE START DATE MONTH AND YEAR
    this.currentMonth = parseInt(this.dates.dateStart.getMonth())
    this.currentYear = parseInt(this.dates.dateStart.getFullYear())

    this.showCalendar(this.currentMonth, this.currentYear)
  }

  render() {
    return (
      <Container id="container" innerRef={this.props.reference}>
        <Header>
          <MonthAndYear id="month-and-year">
            <span id="my-month" />
            <span id="my-year" />
          </MonthAndYear>
          <DateToday id="date-today">
            <span id="today-is-label" />
            <span id="month-day-label" />
            <span id="year-label" />
          </DateToday>
        </Header>
        <Navigation id="navigation">
          <div id="nav-left" onClick={this.handleNavLeftClick.bind(this)} />
          <div id="nav-right" onClick={this.handleNavRightClick.bind(this)} />
        </Navigation>
        <DaysName id="days-name" />
        <Days id="days-body" />
      </Container>
    )
  }
}

const Container = styled.div`
  width: 92%;
  position: relative;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  width: 100%;
  background-color: #d1d3d4;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Navigation = styled.div`
  width: 100%;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
`

const DaysName = styled.div`
  width: 100%;
  background-color: #ffffff;
  display: flex;
  flex-direction: row;
`

const Days = styled.div`
  width: 100%;
  background-color: #ffffff;
`

const MonthAndYear = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const DateToday = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`
