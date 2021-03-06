import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import cx from 'lib/classNames';
import { getDevice } from 'lib/getDeviceFromState';
import DualPartInterstitialHeader from 'app/components/DualPartInterstitial/Header';
import DualPartInterstitialFooter from 'app/components/DualPartInterstitial/Footer';
import XPromoWrapper from 'app/components/XPromoWrapper';
import {
  logAppStoreNavigation,
  navigateToAppStore,
  promoClicked,
} from 'app/actions/xpromo';
import { xpromoThemeIsUsual, scrollPastState } from 'app/selectors/xpromo';

export function DualPartInterstitial(props) {
  const { scrollPast, xpromoThemeIsUsualState} = props;
  const componentClass = 'DualPartInterstitial';
  const displayClasses = cx(componentClass, {
    'xpromoMinimal': !xpromoThemeIsUsualState,
    'fadeOut' : !xpromoThemeIsUsualState && scrollPast,
  });

  return (
    <XPromoWrapper>
      <div className={ displayClasses }>
        <div className={ `${componentClass}__content` }>
          <div className={ `${componentClass}__common` }>
            <DualPartInterstitialHeader { ...props } />
            <DualPartInterstitialFooter { ...props } />
          </div>
        </div>
      </div>
    </XPromoWrapper>
  );
}

export const selector = createSelector(
  getDevice,
  scrollPastState,
  (state => xpromoThemeIsUsual(state)),
  (device, scrollPast, xpromoThemeIsUsualState) => ({
    device, 
    scrollPast, 
    xpromoThemeIsUsualState,
  }),
);

const mapDispatchToProps = dispatch => {
  let preventExtraClick = false;
  return {
    navigator: (visitTrigger, url) => (async () => {
      // Prevention of additional click events
      // while the Promise dispatch is awaiting
      if (!preventExtraClick) {
        preventExtraClick = true;
        // We should not call `await` until the app-store navigation is in progress,
        // see actions/xpromo.navigateToAppStore for more info.
        const trackingPromise = dispatch(logAppStoreNavigation(visitTrigger));
        dispatch(promoClicked());
        navigateToAppStore(url);
        await trackingPromise;
        preventExtraClick = false;
      }
    }),
  };
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const { xpromoThemeIsUsualState } = stateProps;
  const { navigator: dispatchNavigator } = dispatchProps;
  const visitTrigger = xpromoThemeIsUsualState ? 'interstitial_button' : 'banner_button';

  return {
    ...stateProps,
    ...dispatchProps,
    ...ownProps,
    navigator: url => dispatchNavigator(visitTrigger, url),
  };
};

export default connect(selector, mapDispatchToProps, mergeProps)(DualPartInterstitial);
