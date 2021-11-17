import * as React from "react";

const TitleHero = () => {
  return <div className="hero">
    <img src="assets/poop.png"/>
    <div className="title"><a href="/">Top of the Poops</a></div>
    <img src="assets/poop.png"/>
  </div>
}

const ForkMeHero = () => {
  return <div className="fork-me-wrapper">
    <div className="fork-me">
      <a className="fork-me-link" href="https://github.com/top-poop/top-of-the-poops">
        <span className="fork-me-text">Source Code On GitHub</span>
      </a>
    </div>
  </div>
}

export {TitleHero, ForkMeHero}