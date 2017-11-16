import React, { Component } from 'react'
import Header from '../ui/Header'
import SideBar from '../ui/SideBar'
import MainContent from '../ui/MainContent'
import Footer from '../ui/Footer'

export class App extends Component {
  render() {

    return (
      <div className="grid">
        <Header />
        <main>
          <MainContent />
          <SideBar />
        </main>
        <Footer />
      </div>
    );
  }
}
