import React, { Component } from 'react';
import * as Md from 'react-md';
// import ScrollableAnchor from 'react-scrollable-anchor'

export const MainContent = ({children}) =>
  <div className='main-content'>{children}</div>

export class MainContentDemo extends Component {
  render() {

    return (
      <MainContent>
        <h1 className='md-display-1 black'>Front desk</h1>
        <p className='md-headline'>This are the basic messages your boot needs to handle. The front desk will assign other messages to the skill that will be better suited to respond</p>
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
          id="greeting"
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

export default MainContent;
