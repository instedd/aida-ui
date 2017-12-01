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

export const Header = ({icon, title, sectionNavLinks, headerNavLinks, userName, logoutUrl, buttonAction, buttonIcon}) => {
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
      children={<HeaderSubNavWithRouter headerNavLinks={headerNavLinks} buttonAction={buttonAction} buttonIcon={buttonIcon} />}
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
      if (this.props.location.pathname.startsWith(e.props.to))
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

export class HeaderNavLink extends Component {
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
