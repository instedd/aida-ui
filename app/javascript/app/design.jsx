import React, { Component } from 'react'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import { SelectField, Divider, Button, TextField, Checkbox } from 'react-md'

import Header, { HeaderNavLink, HeaderNavAction, SectionNavLink } from '../ui/Header'
import SideBar, { SidebarItem, SidebarMenuItem } from '../ui/SideBar'
import { MainContent } from '../ui/MainContent'
import { MainGrey } from '../ui/MainGrey'
import { EmptyContent } from '../ui/EmptyContent'
import Layout from '../ui/Layout'
import Footer from '../ui/Footer'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import { Listing, Column } from '../ui/Listing'

import Icon from '../components/Icon'

export const App = () =>
  <BrowserRouter>
    <Layout
      header={
        <Header userName="johndoe" logoutUrl="#"
          icon={<Icon/>}
          title="WFP chat bot"
          sectionNavLinks={[
            <SectionNavLink label="Bots" to="/" />,
            <SectionNavLink label="Other" to="/" />,
          ]}
          headerNav={[
            <HeaderNavLink label="Analytics" to="#" />,
            <HeaderNavLink label="Data" to="/_design/empty" />,
            <HeaderNavLink label="Channels" to="/_design/channel" />,
            <HeaderNavLink label="Behaviour" to="/_design/behaviour" />,
            <HeaderNavLink label="Translations" to="#" />,
            <HeaderNavLink label="Collaborators" to="#" />,
          ]}
          headerNavExtra={[
            <HeaderNavAction label="Lorem" />,
            <HeaderNavAction label="Ipsum" />,
          ]}
          buttonIcon="add"
        />
      }
      footer={<Footer>Version: 0.0</Footer>}>

      <Route exact path="/_design" render={() => <Redirect to="/_design/behaviour"/>} />
      <Route exact path="/_design/behaviour" component={MainContentDemo} />
      <Route exact path="/_design/channel" component={MainFullWidthDemo} />
      <Route exact path="/_design/empty" component={EmptyDemo} />
    </Layout>
  </BrowserRouter>

const EmptyDemo = () =>
  <EmptyContent icon='storage'>
    <Headline>You have no data collected on this proyect
    <span><a href="#" target="_blank">Create One</a></span>
    </Headline>
    <Divider />
    <p>You’ll be able to manage behaviour, translations and access data.</p>
    <Button flat secondary swapTheming>Accept Invitation</Button>
    <Button flat>Back to Channels</Button>
  </EmptyContent>

const MainFullWidthDemo = () =>
  <MainContent>
    <Title>Setup a Facebook channel</Title>
    <Headline>
      In order to setup this channel you first need to
      create a <a href="https://www.facebook.com/business/products/pages" target="_blank">Facebook page</a> and
      then <a href="https://developers.facebook.com/docs/messenger-platform/getting-started/app-setup" target="_blank">subscribe a bot</a>.
    </Headline>

    <Field label="Page ID" />
    <Field label="Verify Token" />
    <Field label="Access Token" />
  </MainContent>

class MainContentDemo extends Component {
  render() {
    const skillActions = ([
      <SidebarMenuItem key="0" icon="edit" label="Rename" />,
      <SidebarMenuItem key="1" icon="close" label="Delete" />,
    ])

    const sidebar = (<SideBar title="Skills">
      <SidebarItem id="abc" icon="chat" label="Front desk" active={true}/>
      <SidebarItem id="abc" icon="flag" label="Language detector" enabled={true} menuItems={skillActions} />
      <SidebarItem id="abc" icon="loop" label="Collect feedback" enabled={false} menuItems={skillActions} />
      <SidebarItem id="abc" icon="place" label="Geo-locator" enabled={true} menuItems={skillActions} />
      <SidebarItem id="abc" icon="assignment_turned_in" label="Food survey" enabled={false} menuItems={skillActions} />
    </SideBar>)

    return (
      <MainContent sidebar={sidebar}>
        <Title>Front desk</Title>
        <Headline>This are the basic messages your boot needs to handle. The front desk will assign other messages to the skill that will be better suited to respond</Headline>

        <TextField
          label="Greeting"
          lineDirection="center"
          defaultValue="Hello I'm a simple chatbot"
          id="field01"
        />
        <Checkbox
          id="greeting"
          name="simple-checkboxes[]"
          label="Show greeting after language selection"
        />

        <TextField
          label="Skills introduction"
          lineDirection="center"
          defaultValue="I'm always learning new skills, but I can already help  you with a few things"
          id="field02"
        />
        <Checkbox
          id="skills"
          name="simple-checkboxes[]"
          label="Always show skill introduction for first time users"
        />

        <TextField
          label="Didn't understand message"
          lineDirection="center"
          defaultValue="Sorry I didn't understand that. Let me tell you some examples of things I can help you with."
          id="field03"
        />
        <Checkbox
          id="understand"
          name="simple-checkboxes[]"
          label="Repeat skills introduction for first time users"
        />
        <p>Show when no skill claims more than 70% confidence</p>

        <TextField
          label="Clarification message"
          lineDirection="center"
          defaultValue="I am not sure what you meant. Please use a short sentence with a simple topic"
          id="field04"
        />
        <Checkbox
          id="clarification"
          name="simple-checkboxes[]"
          label="Ask for clarification when several skills claim a high confidence"
        />
      </MainContent>
    );
  }
}
