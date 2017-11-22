import React, { Component, Children } from 'react';
import { Tabs, Tab, ListItem, MenuButton, Toolbar, Button } from 'react-md'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import UserMenu from './UserMenu'

const nav = ({userName, logoutUrl}) => {
  return (
    <nav>
      <div className='sections'>
        <Button href='/' flat>Bots</Button>
      </div>
      <UserMenu userName={userName} logoutUrl={logoutUrl}/>
    </nav>
  )
}

export const Header = ({icon, title, headerNavLinks, userName, logoutUrl}) => {
  return (
    <Toolbar
      className='mainToolbar'
      colored
      nav={nav({userName, logoutUrl})}
      title={
        <div className='sub-nav'>
          {icon}
          <h1>{title}</h1>
        </div>
      }
      children={<HeaderSubNavWithRouter headerNavLinks={headerNavLinks} />}
      prominent
    />
  )
}

class HeaderSubNav extends Component {
  render() {
    const items = [
      <ListItem key={0} primaryText={<i className='material-icons dummy'>more_vert</i>} />,
      <ListItem key={1} primaryText="Item One" />,
      <ListItem key={2} primaryText="Item Two" />,
      <ListItem key={3} primaryText="Item Three" />,
      <ListItem key={4} primaryText="Item Four" />,
    ]

    let selectedTab = 0
    Children.forEach(this.props.headerNavLinks, (e, index) => {
      if (this.props.location.pathname == e.props.to)
        selectedTab = index
    })

    return (
        <nav className="mainTabs">
          {(() => {
            if (this.props.headerNavLinks) {
              return (
                <Tabs id="mainTabs" tabId="mainTabs" defaultTabIndex={selectedTab}>
                  { Children.map(this.props.headerNavLinks, (e, index) =>
                    <Tab label={e.props.label} key={index} component={Link} to={e.props.to} />
                  )}
                </Tabs>
              )
            }
          })()}

          <MenuButton
            id="more-menu"
            className="btn-more"
            flat
            position={MenuButton.Positions.BELOW}
            menuItems={items}>
            <i className='material-icons dummy'>more_vert</i>
          </MenuButton>

          <Button
            onClick={this.props.onClick}
            floating
            secondary
            className="md-cell--right md-cell--bottom add-button">
            track_changes
          </Button>
        </nav>
    );
  }
}

const HeaderSubNavWithRouter = withRouter(HeaderSubNav)

export class HeaderNavLink extends Component {
  render() {
    return null
  }
}

export default Header
