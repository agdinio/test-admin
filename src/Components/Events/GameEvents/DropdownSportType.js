import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer, inject } from 'mobx-react'
import styled from 'styled-components'
import '@/styles/dropdown-sporttype.css'
import { vhToPx, vwToPx, evalImage } from '@/utils'
const h = 5

export default class DropdownSportType extends Component {
  render() {
    return (
      <Container>
        <ul class="nav site-nav">
          {/*<li><a>Lorem</a></li>*/}
          {/*<li><a>Ipsum</a></li>*/}
          <li className="flyout">
            <a>Dolor</a>

            <ul className="flyout-content nav stacked">
              <li>
                <a>Foo Bar</a>
              </li>
              <li>
                <a>Bar Baz</a>
              </li>
              <li className="flyout-alt">
                <a>Baz Foo</a>

                <ul className="flyout-content nav stacked">
                  <li>
                    <a>Foo Bar</a>
                  </li>
                  <li>
                    <a>Bar Baz</a>
                  </li>
                  <li className="flyout-alt">
                    <a>Baz Foo</a>

                    <ul className="flyout-content nav stacked">
                      <li className="flyout-alt">
                        <a>Foo Bar</a>

                        <ul className="flyout-content nav stacked">
                          <li>
                            <a>Bar Baz</a>
                          </li>
                          <li className="flyout-alt">
                            <a>Baz Foo</a>

                            <ul className="flyout-content nav stacked">
                              <li>
                                <a>Bar Baz</a>
                              </li>
                              <li>
                                <a>Baz Foo</a>
                              </li>
                              <li>
                                <a>Foo Bar</a>
                              </li>
                            </ul>
                          </li>
                          <li>
                            <a>Foo Bar</a>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <a>Bar Baz</a>
                      </li>
                      <li className="flyout-alt">
                        <a>Baz Foo</a>

                        <ul className="flyout-content nav stacked">
                          <li>
                            <a>Bar Baz</a>
                          </li>
                          <li>
                            <a>Baz Foo</a>
                          </li>
                          <li>
                            <a>Foo Bar</a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          {/*<li><a>Sit</a></li>*/}
          {/*<li><a>Amet</a></li>*/}
        </ul>
      </Container>
    )
  }
}

const Container = styled.div``
