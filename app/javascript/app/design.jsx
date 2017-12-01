import React, { Component } from 'react'
import Layout from '../ui/Layout'
import Header, { HeaderNavLink, SectionNavLink } from '../ui/Header'
import SideBar from '../ui/SideBar'
import { MainContent } from '../ui/MainContent'
import Footer from '../ui/Footer'
import Title from '../ui/Title'
import Headline from '../ui/Headline'
import Field from '../ui/Field'
import Icon from '../components/Icon'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import * as Md from 'react-md'

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
          headerNavLinks={[
            <HeaderNavLink label="Analytics" to="#" />,
            <HeaderNavLink label="Data" to="#" />,
            <HeaderNavLink label="Channels" to="/_design/channel" />,
            <HeaderNavLink label="Behaviour" to="/_design/behaviour" />,
            <HeaderNavLink label="Translations" to="#" />,
            <HeaderNavLink label="Collaborators" to="#" />,
          ]}
        />
      }
      footer={<Footer/>}>

      <Route exact path="/_design" render={() => <Redirect to="/_design/behaviour"/>} />
      <Route exact path="/_design/behaviour" component={MainContentDemo} />
      <Route exact path="/_design/channel" component={MainFullWidthDemo} />
    </Layout>
  </BrowserRouter>

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

    return (
      <MainContent sidebar={<SideBar/>}>
        <Title>Front desk</Title>
        <Headline>This are the basic messages your boot needs to handle. The front desk will assign other messages to the skill that will be better suited to respond</Headline>

        <Md.TextField
          label="Greeting"
          lineDirection="center"
          defaultValue="Hello I'm a simple chatbot"
          id="field01"
        />
        <Md.Checkbox
          id="greeting"
          name="simple-checkboxes[]"
          label="Show greeting after language selection"
        />

        <Md.TextField
          label="Skills introduction"
          lineDirection="center"
          defaultValue="I'm always learning new skills, but I can already help  you with a few things"
          id="field02"
        />
        <Md.Checkbox
          id="skills"
          name="simple-checkboxes[]"
          label="Always show skill introduction for first time users"
        />

        <Md.TextField
          label="Didn't understand message"
          lineDirection="center"
          defaultValue="Sorry I didn't understand that. Let me tell you some examples of things I can help you with."
          id="field03"
        />
        <Md.Checkbox
          id="understand"
          name="simple-checkboxes[]"
          label="Repeat skills introduction for first time users"
        />
        <p>Show when no skill claims more than 70% confidence</p>

        <Md.TextField
          label="Clarification message"
          lineDirection="center"
          defaultValue="I am not sure what you meant. Please use a short sentence with a simple topic"
          id="field04"
        />
        <Md.Checkbox
          id="clarification"
          name="simple-checkboxes[]"
          label="Ask for clarification when several skills claim a high confidence"
        />

{/*        <Md.ExpansionList style={{ padding: 16 }}>
          <Md.ExpansionPanel  secondaryLabel="Do you smoke?" defaultExpanded>
          </Md.ExpansionPanel>
          <Md.ExpansionPanel secondaryLabel="Do you drink?">
          </Md.ExpansionPanel>
          <Md.ExpansionPanel secondaryLabel="How are you today?">
          </Md.ExpansionPanel>
        </Md.ExpansionList>
       <ScrollableAnchor id={'section1'}>
        <div className='end'> How are you world? </div>
      </ScrollableAnchor>*/}
      </MainContent>
    );
  }
}
