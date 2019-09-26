import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Lipping from '../Lipping';
import SiteHeader from '../SiteHeader';
import { SiteFooter, SiteFooterLink } from '../SiteFooter';
import { SideNavigation, SideNavigationLink } from '../SideNavigation';
import Search from '../Search/Search.js';
import GoogleMaps from '../GoogleMaps';
import { EventShowcase, Event } from '../EventShowcase';
import EventOverlay from '../EventOverlay/EventOverlay';
import { OverlayTransitionWrapper } from '../OverlayBackdrop';
import AsideMenu from '../AsideMenu';
import Calendar from '../Calendar';
import LandingPageLoading from './LandingPageLoading';
import LandingPageError from './LandingPageError';
import VergicChatButton from '../VergicChatButton';
import Scrollbars from 'react-custom-scrollbars';
import EventsDateList from '../EventsDateList.js';
import { connect } from 'react-redux';
import { eventsFetchData } from '../../actions/events';
import { iframeUrl } from '../../actions/iframeUrl';
import LanguageFlags from '../LanguageFlags';
import formatRelativeUrl from '../../util/formatRelativeUrl';
import { selectedEventsWithCoordinates } from './landingPageHelpers.js';

import './LandingPage.css';

export class LandingPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleModals: [],
      visibleOverlayEvent: props.activeEvent || null,
      activeCategories: [],
      selectedDates: null
    };
  }

  static fetchData({ store }) {
    return store.dispatch(
      eventsFetchData('/api/events', store.getState().activeLanguage)
    );
  }

  toggleModalVisibility(modalId) {
    const { visibleModals } = this.state;
    this.setState(visibleModals.includes(modalId)
      ? { visibleModals: visibleModals.filter(x => x !== modalId) }
      : { visibleModals: visibleModals.concat([modalId]) });
  }

  changeOverlayEvent(event, showDirections = false) {
    const eventSlug = event ? event.slug : null;
    const eventToShow = this.props.events.find(e => e.slug === eventSlug);

    this.changeUrl(event ? event.slug : this.state.visibleOverlayEvent, event !== null);
    this.setState({
      visibleOverlayEvent: eventToShow ? eventToShow.slug : null,
      showDirections: showDirections
    });
  }

  changeUrl(param, addParam) {
    const newUrl = addParam
      ? `${window.location.pathname}/${param}`
      : window.location.pathname.replace(`/${param}`, '');
    window.history.pushState({ path: window.location.pathname }, '', newUrl);
  }

  componentDidMount() {
    const dataIsEmpty = !this.props.events || !Object.keys(this.props.events).length;
    if (dataIsEmpty) {
      this.props.fetchData('/api/events', this.props.activeLanguage);
    }

    const params = new window.URL(window.location.href).searchParams;
    const categoryIds = params && params.get('category');
    if (categoryIds) {
      categoryIds.split(',').forEach(id => {
        this.setState({
          activeCategories: this.state.activeCategories.concat(parseInt(id, 10))
        });
      });
    }
  }

  handleSelectedDates(selectedDates) {
    this.setState({
      selectedDates: selectedDates
    });
    if (this.refs.eventsDateListScroll) {
      this.refs.eventsDateListScroll.scrollToTop();
    }
  }

  // eslint-disable-next-line no-shadow
  handleSideNavClick({id, type, menuItem, iframeUrl}) {
    if (type === 'googleQueryPlace') {
      this.props.setIframeUrl({url: iframeUrl});
    } else if (type === 'iframe') {
      this.props.setIframeUrl(menuItem);
    } else if (type === 'page') {
      this.props.setIframeUrl({url: formatRelativeUrl(menuItem.url)});
    } else if (type && type === 'event') {
      this.changeOverlayEvent(menuItem);
    } else {
      const { activeCategories } = this.state;

      this.setState(activeCategories.includes(id)
        ? { activeCategories: activeCategories.filter(x => x !== id) }
        : { activeCategories: activeCategories.concat(id) });
    }
  }

  render() {
    if (this.props.hasErrored) {
      return (
        <LandingPageError
          reloadPage={() => this.props.fetchData('/api/events', this.props.activeLanguage)}
        />
      );
    }

    const dataIsEmpty = !this.props.events || !Object.keys(this.props.events).length;
    if (this.props.isLoading || dataIsEmpty) {
      return <LandingPageLoading bgColor={this.props.bgColor} />;
    }
    const pageData = this.props.landingPages[this.props.type];
    return (
      <div className='LandingPage'>
        <Lipping />
        <SiteHeader
          heading={pageData.heading}
          bgColor={this.props.bgColor}
          freeWifiLink={this.props.landingPages.shared.freeWifi}
        />

        <Search
          events={this.props.events}
          changeOverlayEvent={this.changeOverlayEvent.bind(this)}
          pageType={this.props.type}
          activeLanguage={this.props.activeLanguage}
        />

        <SideNavigation>
          {pageData.menu !== null && pageData.menu.map(menu =>
            (<SideNavigationLink
              id={menu.id || menu.menuId}
              key={menu.id || menu.menuId}
              name={menu.name}
              activeCategories={this.state.activeCategories}
              activeColor={menu.activeColor}
              handleClick={this.handleSideNavClick.bind(this)}
              type={menu.type}
              iframeUrl={menu.iframeUrl}
              icon={menu.iconName}
              subCategories={menu.subItems}
              menuItem={menu}
            />))
          }
          {pageData.menu === null && pageData.categories &&
          !!pageData.categories.length && pageData.categories.map(cat =>
              (<SideNavigationLink
                id={cat.id}
                key={cat.id}
                name={cat.name}
                activeCategories={this.state.activeCategories}
                activeColor={cat.activeColor}
                handleClick={this.handleSideNavClick.bind(this)}
                icon={cat.iconName}
                subCategories={cat.subCategories}
              />))
          }
        </SideNavigation>

        <main>
          <div className='LandingPage-mapWrapper'>
            <GoogleMaps
              {...selectedEventsWithCoordinates(
                this.props.events,
                this.state.activeCategories,
                pageData.categories
              ) }
              visibleModals={this.state.visibleModals}
              handleToggleModalVisibility={this.toggleModalVisibility.bind(this)}
              handleShowMoreInfo={this.changeOverlayEvent.bind(this)}
              apiKey={this.props.googleMapsApiKey}
            />
          </div>
          <EventShowcase>
            {pageData.pages.map((event, index) => {
              switch (event.type) {
              case 'iframe':
                return (
                  <Event
                    key={index}
                    {...event}
                    onClick={(url) => this.props.setIframeUrl(url)} />
                );
              case 'page':
                return (
                  <Event
                    key={index}
                    {...event}
                    onClick={() => {
                      this.props.setIframeUrl({ url: formatRelativeUrl(event.url) });
                    }}
                  />
                );
              case 'event':
                return (
                  <Event
                    key={index}
                    {...event}
                    onClick={this.changeOverlayEvent.bind(this)} />
                );
              default:
                return null;
              }
            })
            }
          </EventShowcase>
          <SiteFooter color={this.props.bgColor} backToStartPath={`/${this.props.activeLanguage}/`}>
            {pageData.bottomLinks.map((link) => (
              <SiteFooterLink key={link.href + link.name} link={link} />))
            }
            <VergicChatButton pageName={pageData.heading} color={this.props.bgColor} />
            <div className='Startpage-langWrapper'>
              <LanguageFlags activeLanguage={this.props.activeLanguage} />
            </div>
          </SiteFooter>
          <OverlayTransitionWrapper>
            {this.state.visibleOverlayEvent &&
              <EventOverlay
                key='event-overlay'
                pageType='LandingPage'
                event={this.props.events.find(e => e.slug === this.state.visibleOverlayEvent)}
                handleClose={() => this.changeOverlayEvent(null)}
                changeOverlayEvent={this.changeOverlayEvent.bind(this)}
                showDirections={this.state.showDirections}
              />
            }
          </OverlayTransitionWrapper>
        </main>
        <aside>
          <AsideMenu>
            <Calendar
              themeCssClass={this.props.type}
              handleSelectedDates={this.handleSelectedDates.bind(this)}
              locale={this.props.activeLanguage}
            />
            <Scrollbars
              ref='eventsDateListScroll'
              autoHeight
              autoHeightMax={`${this.props.isInPortraitMode ?
                '90vh - 3.25rem' : '80vh'} - 3.25rem - 4.6875rem - 400px - 2rem`}
            >
              <EventsDateList
                events={this.props.events}
                selectedDates={this.state.selectedDates}
                handleOverlayEvent={this.changeOverlayEvent.bind(this)}
              />
            </Scrollbars>
          </AsideMenu>
        </aside>
      </div>
    );
  }
}

LandingPage.propTypes = {
  type: PropTypes.oneOf(['visitor', 'local']),
  bgColor: PropTypes.string,
  fetchData: PropTypes.func.isRequired,
  activeLanguage: PropTypes.string.isRequired,
  events: PropTypes.any,
  categories: PropTypes.array,
  landingPages: PropTypes.any,
  hasErrored: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  activeEvent: PropTypes.string,
  googleMapsApiKey: PropTypes.string,
  directions: PropTypes.shape({
    origin: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired,
    destination: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired
  }),
  setIframeUrl: PropTypes.func,
  isInPortraitMode: PropTypes.bool
};

const mapStateToProps = (state) => {
  return {
    events: state.events[state.activeLanguage],
    activeLanguage: state.activeLanguage,
    landingPages: state.landingPages[state.activeLanguage],
    hasErrored: (state.activeLanguage in state.eventsHasErrored)
      ? state.eventsHasErrored[state.activeLanguage] : false,
    isLoading: (state.activeLanguage in state.eventsAreLoading)
      ? state.eventsAreLoading[state.activeLanguage] : false,
    googleMapsApiKey: state.siteSettings.googleMapsApiKey,
    isInPortraitMode: state.isInPortraitMode
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: (url, lang) => dispatch(eventsFetchData(url, lang)),
    setIframeUrl: (url) => dispatch(iframeUrl(url))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LandingPage);
