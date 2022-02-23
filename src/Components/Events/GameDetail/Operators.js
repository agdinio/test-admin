import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import styled from 'styled-components'
import { vhToPx, vwToPx } from '@/utils'
import XIcon from '@/assets/images/icon-x.svg'
import CheckIcon from '@/assets/images/icon-check.svg'
import UpArrowIcon from '@/assets/images/preplay-up-arrow-black.svg'

const Roles = [
  {id: 1, roleName: 'nfl group 1', disabled: true},
  {id: 2, roleName: 'exec. producer'},
  {id: 3, roleName: 'exec. director'},
  {id: 4, roleName: 'asst. director'},
  {id: 5, roleName: 'checker'},
  {id: 6, roleName: 'senior executive'}
]
const Users = [
  {roleId: 5, userName: 'name 51'},
  {roleId: 5, userName: 'name 52'},
  {roleId: 5, userName: 'name 53'},
  {roleId: 6, userName: 'name 61'},
  {roleId: 6, userName: 'name 62'},
  {roleId: 6, userName: 'name 63'},
]

@observer
export default class Operators extends Component {
  constructor(props) {
    super(props)
    extendObservable(this, {
      addingComponent: null,
    })
    h = this.props.height
    this.newOperator = { role: {}, user: {} }
  }

  handleConfirmClick() {
    if (Object.keys(this.newOperator.role).length > 0 && Object.keys(this.newOperator.user).length > 0) {
      this.props.pushOperator(this.newOperator)
      this.addingComponent = null;
    } else {
      this.addingComponent = null;
    }
  }

  handleRoleChange(e) {
    this.newOperator.role = JSON.parse(e.target.value)
    this.addingComponent = <AddingComponent item={this.newOperator} roleChange={this.handleRoleChange.bind(this)} userChange={this.handleUserChange.bind(this)} confirmClick={this.handleConfirmClick.bind(this)} />
  }

  handleUserChange(e) {
    this.newOperator.user = JSON.parse(e.target.value)
    this.addingComponent = <AddingComponent item={this.newOperator} roleChange={this.handleRoleChange.bind(this)} userChange={this.handleUserChange.bind(this)} confirmClick={this.handleConfirmClick.bind(this)} />
  }

  handleAddUserRole() {

    this.newOperator = { role: {}, user: {} }
    this.addingComponent = <AddingComponent item={this.newOperator} roleChange={this.handleRoleChange.bind(this)} userChange={this.handleUserChange.bind(this)} confirmClick={this.handleConfirmClick.bind(this)} />
  }

  handleRemoveClick(item) {
    const idx = this.props.operators.findIndex(o => o.role === item.role && o.user === item.user);
    if (idx > -1) {
      this.props.removeOperator(idx)
    }
  }

  render() {
    let { operators } = this.props

    return (
      <Container>
        <Wrapper>
          <Content>
            {
              (operators || []).map((item, idx) => {
                return (
                  <OperatorItem
                    key={`operator-${item.role.roleName}-${idx}`}
                    item={item}
                    removeClick={this.handleRemoveClick.bind(this, item)}
                  />
                )
              })
            }

            {
              this.addingComponent
            }

          </Content>
          <AddUserRolesButton onClick={this.handleAddUserRole.bind(this)} />
        </Wrapper>
      </Container>
    )
  }
}

let h = 0
const Container = styled.div`
  width: 100%;
`

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Content = styled.div`
  display: flex;
  flex-direction: column;  
`

const AddUserRolesButton = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  background-color: #a7a9ac;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:before {
    content: '+';
    font-family: pamainregular;
    font-size: ${props => vhToPx(h * 0.5)};
    color: #eaeaea;
    line-height: 1;
    margin-top: 0.2%;
  }
  &:after {
    content: 'ADD USERS & ROLES';
    font-family: pamainbold;
    font-size: ${props => vhToPx(h * 0.4)};
    color: #eaeaea;
    line-height: 1;
    margin-top: 0.3%;
  }
`

const AddingComponent = (props) => {

  let {item} = props

  const users = Users.filter(o => o.roleId === (item.role && item.role.id ? item.role.id : 0))
  const forConfirm = (Object.keys(item.role).length > 0 && Object.keys(item.user).length > 0) ? true : false

  return (
    <ItemContainer>
      <ItemWrap>
        <DDRoles value={JSON.stringify(item.role)} onChange={props.roleChange}>
          <option key="role-blank" value={JSON.stringify({})}>select role/group</option>
          {
            Roles.map(role => <option style={{backgroundColor:'#bcbec0'}} key={`${role.id}-${role.roleName}`} value={JSON.stringify(role)}>{role.roleName}</option>)
          }
        </DDRoles>
        <DDUsers value={JSON.stringify(item.user)} onChange={props.userChange}>
          <option key="user-blank" value={JSON.stringify({})}>select user</option>
          {
            (users || []).map(user => <option key={`${user.roleId}-${user.userName}`} value={JSON.stringify(user)}>{user.userName}</option>)
          }
        </DDUsers>
        <Check src={forConfirm ? CheckIcon : XIcon} onClick={props.confirmClick} />
      </ItemWrap>
    </ItemContainer>
  )
}

const OperatorItem = (props) => {
  let {item} = props
  return (
    <ItemContainer>
      <ItemWrap>
        <Role>{item.role.roleName}</Role>
        <User>{item.user.userName}</User>
        <Remove onClick={props.removeClick} />
      </ItemWrap>
    </ItemContainer>
  )
}

const ItemContainer = styled.div`
  width: 100%;
  height: ${props => vhToPx(h)};
  margin-bottom: ${props => vhToPx(0.3)};
`

const ItemWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
`

const Role = styled.div`
  width: 46%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  color: #000000;
  line-height: 1;
  height: 100%;
  text-transform: uppercase;
  white-space: nowrap;
  padding-left: 2%;
  padding-top: 1%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
`

const User = styled.div`
  width: 46%;
  font-family: pamainbold;
  font-size: ${props => vhToPx(h * 0.4)};
  color: #000000;
  line-height: 1;
  height: 100%;
  text-transform: uppercase;
  white-space: nowrap;
  padding-left: 2%;
  padding-top: 1%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
`

const DDRoles = styled.select`
  width: 46%;
  height: ${props => vhToPx(h)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  padding-top: ${props => vhToPx(0.2)};
  font-family: pamainbold;
  font-size: ${props => vhToPx((h*0.8) * 0.5)};
  line-height: 0.9;  
  text-transform: uppercase;
  text-indent: ${props => vwToPx(0.5)};
  background-image: url(${props => UpArrowIcon});
  background-repeat: no-repeat;
  background-size: ${props => vhToPx(1.8)};
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-color: #d3d3d3;
  border-top: ${props => vhToPx(0.1)} solid #d3d3d3;
`

const DDUsers = styled.select`
  width: 46%;
  height: ${props => vhToPx(h)};
  outline: none;
  border: none;
  -webkit-appearance: none;
  padding-top: ${props => vhToPx(0.2)};
  font-family: pamainbold;
  font-size: ${props => vhToPx((h*0.8) * 0.5)};
  line-height: 0.9;  
  text-transform: uppercase;
  text-indent: ${props => vwToPx(0.5)};
  background-image: url(${props => UpArrowIcon});
  background-repeat: no-repeat;
  background-size: ${props => vhToPx(1.8)};
  background-position: bottom ${props => vhToPx(-0.5)} right;
  background-color: #f2f2f2;
  /*border-top: ${props => vhToPx(0.1)} solid #d3d3d3;*/
`

const Check = styled.div`
  width: 8%;
  height: ${props => vhToPx(h)};
  background-color: #bfbfbf;
  cursor: pointer;
  &:after {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    background-image: url(${props => props.src});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
`

const Remove = styled.div`
  width: 8%;
  height: ${props => vhToPx(h)};
  background-color: #bfbfbf;
  cursor: pointer;
  &:after {
    content: '';
    display: inline-block;
    width: 100%;
    height: 100%;
    background-image: url(${XIcon});
    background-repeat: no-repeat;
    background-size: 70%;
    background-position: center;
  }
`
