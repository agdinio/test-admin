import React, { Component } from 'react'
import styled from 'styled-components'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import { vhToPx, vwToPx, isEqual, evalImage } from '@/utils'
import ReactQuill, { Quill } from 'react-quill'
import DDColor from './DDColor'
import DDFont from './DDFont'

export default class TextEditor extends Component {
  constructor(props) {
    super(props)
    h = this.props.height
    this.state = {
      font: this.props.font,
      color: this.props.color,
    }

    this.editor = null
  }

  handleColorValue(newColor) {
    try {
      if (this.editor) {
        if (this.editor.getSelection()) {
          let index = this.editor.getSelection().index
          let length = this.editor.getSelection().length
          this.editor.formatText(index, length, 'color', newColor, true)
        }

        this.editor.format('color', newColor)
        this.setState({ color: newColor })
        this.props.updatedValue({ type: 'color', value: newColor })
      }
    } catch (err) {}
  }

  handleFontValue(newFont) {
    try {
      if (this.editor) {
        if (this.editor.getSelection()) {
          let index = this.editor.getSelection().index
          let length = this.editor.getSelection().length
          this.editor.formatText(index, length, 'font', newFont, true)
        }

        this.editor.format('font', newFont)
        this.setState({ font: newFont })
        this.props.updatedValue({ type: 'font', value: newFont })
      }
    } catch (err) {
      console.log(err)
    }
  }

  initValue() {
    this.editor.root.innerHTML = this.props.value
  }

  initValuesForColorAndFont() {
    /*
    this.editor.setSelection(0, this.props.value.length)
    this.editor.formatText(
      0,
      this.props.value.length,
      'font',
      this.state.font,
      true
    )
    this.editor.formatText(
      0,
      this.props.value.length,
      'color',
      this.state.color,
      true
    )
*/
    this.editor.format('font', this.state.font)
    this.editor.format('color', this.state.color)
  }

  handleEditorFocus() {
    this.props.handleFocus()
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.font !== nextState.font) {
      return true
    }

    if (this.state.color !== nextState.color) {
      return true
    }

    return false
  }

  componentDidMount() {
    let Font = Quill.import('formats/font')
    Font.whitelist = [
      'pamainlight',
      'pamainregular',
      'pamainbold',
      'pamainextrabold',
    ]
    Quill.register(Font, true)
    this.editor = new Quill(`.${this.props.reference}`, {
      modules: {
        toolbar: false,
      },
      theme: 'snow',
    })

    this.editor.on('text-change', () => {
      const strippedHTMLTags = this.editor.root.innerHTML
        .toString()
        .replace(/(<([^>]+)>)/gi, '')

      if (!strippedHTMLTags) {
        this.editor.format('font', this.state.font)
        this.editor.format('color', this.state.color)
      }

      const newLine = strippedHTMLTags.substring(strippedHTMLTags.length - 2)
      if (newLine.toLowerCase() === '\\n') {
        //this.editor.root.innerHTML = this.editor.root.innerHTML.substring(0, this.editor.root.innerHTML.length - 4)
        //this.editor.formatText(this.editor.root.innerHTML.length)

        //this.editor.setSelection(this.editor.getLength() - 2, this.editor.getLength())
        /////////////////////this.editor.formatText(this.editor.getLength() - 3, this.editor.getLength(), 'color', '', true)
        //this.editor.formatText(this.editor.getLength(), this.editor.getLength() + 1, 'color', 'rgb(1, 1, 1)', true)
        //this.editor.insertText(this.editor.getLength() - 1, 'PRE-PICKS', 'bold', true)
        //this.editor.insertEmbed(this.editor.getLength() - 1, 'break', 'prepick')

        this.editor.insertText(
          this.editor.getLength(),
          'prepicks',
          { color: 'rgb(0, 0, 0)', font: 'pamainbold' },
          true
        )
      }

      this.props.updatedValue({
        type: 'value',
        value: this.editor.root.innerHTML,
      })
    })

    this.initValue()
    setTimeout(() => this.initValuesForColorAndFont(), 0)
  }

  render() {
    let { reference } = this.props
    let { font, color } = this.state

    return (
      <Container>
        <Editor
          id="admin-editor"
          font={font}
          color={color}
          className={reference}
          onFocus={this.handleEditorFocus.bind(this)}
        />
        <DDColor
          height={h}
          index={`ddcolor-${reference}`}
          value={this.handleColorValue.bind(this)}
          defaultColor={color}
        />
        <DDFont
          height={h}
          index={`ddfont-${reference}`}
          value={this.handleFontValue.bind(this)}
          defaultFont={font}
        />
      </Container>
    )
  }
}

let h = 0
const Container = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 2.5)};
  display: flex;
  justify-content: space-between;
`

const Editor = styled.div`
  width: 100%;
  height: ${props => vhToPx(h * 2.5)};
  background-color: #ffffff;
  font-family: ${props => props.font};
  color: ${props => props.color};
  font-size: ${props => vhToPx(h * 0.4)};
`
