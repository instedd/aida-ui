import React, { Component, Children } from 'react';
import { Tabs, Tab, ListItem, MenuButton, Toolbar, Button } from 'react-md'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import UserMenu from './UserMenu'

const nav = ({sectionNavLinks, userName, logoutUrl}) => {
  return (
    <nav>
      <SectionNavWithRouter sectionNavLinks={sectionNavLinks} />
      <UserMenu userName={userName} logoutUrl={logoutUrl}/>
    </nav>
  )
}

const SectionNav = ({sectionNavLinks}) => {
  return (
    <div className='sections'>
      { Children.map(sectionNavLinks, (e, index) =>
        <Button to={e.props.to} flat component={Link} key={index}>{e.props.label}</Button>
      )}
    </div>
  )
}

const SectionNavWithRouter = withRouter(SectionNav)

export const Header = ({icon, title, sectionNavLinks, headerNav, headerNavExtra, userName, logoutUrl, buttonAction, buttonIcon}) => {
  return (
    <Toolbar
      className='mainToolbar'
      colored
      nav={nav({sectionNavLinks, userName, logoutUrl})}
      title={
        <div className='sub-nav'>
          {icon}
          <h1>{title}</h1>
        </div>
      }
      children={<HeaderSubNavWithRouter headerNav={headerNav} headerNavExtra={headerNavExtra} buttonAction={buttonAction} buttonIcon={buttonIcon} />}
      prominent
    />
  )
}

class HeaderSubNav extends Component {
  render() {
    const items = [
      <ListItem key={0} primaryText={<i className='material-icons dummy'>more_vert</i>} />
    ]

    let selectedTab = 0
    Children.forEach(this.props.headerNav, (e, index) => {
      // TODO allow HeaderNavAction to be active
      if (this.props.location.pathname.startsWith(e.props.to))
        selectedTab = index
    })

    Children.forEach(this.props.headerNavExtra, (e, index) => {
      // TODO allow HeaderNavLink to be used as headerNavExtra
      items.push(<ListItem key={index+1} primaryText={e.props.label} onClick={e.props.onClick} />)
    })

    return (
        <nav className="mainTabs">
          {(() => {
            if (this.props.headerNav) {
              return (
                <Tabs id="mainTabs" tabId="mainTabs" activeTabIndex={selectedTab} onTabChange={() => null} overflowMenu={true}>
                  { Children.map(this.props.headerNav, (e, index) =>
                    // TODO allow HeaderNavAction to be used as headerNav
                    <Tab label={e.props.label} key={index} component={Link} to={e.props.to} />
                  )}
                </Tabs>
              )
            }
          })()}

          {(() => {
            if (items.length > 1) {
              return (
                <MenuButton
                  id="more-menu"
                  className="btn-more"
                  flat
                  position={MenuButton.Positions.BELOW}
                  menuItems={items}>
                  <i className='material-icons dummy'>more_vert</i>
                </MenuButton>
              )
            }
          })()}

          <Button
            onClick={this.props.buttonAction}
            floating
            secondary
            className="md-cell--right md-cell--bottom add-button">
            {this.props.buttonIcon}
          </Button>
        </nav>
    );
  }
}

const HeaderSubNavWithRouter = withRouter(HeaderSubNav)

// HeaderNavLink relates to react-router-dom
// The link is active (ie: highlighted) if the current location is prefix
export class HeaderNavLink extends Component {
  render() {
    return null
  }
}

// TODO HeaderNavAction should allow active property
export class HeaderNavAction extends Component {
  render() {
    return null
  }
}

export class SectionNavLink extends Component {
  render() {
    return null
  }
}

export default Header
