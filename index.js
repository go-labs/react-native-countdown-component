import React from 'react';
import PropTypes from 'prop-types';

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState
} from 'react-native';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

const DEFAULT_BG_COLOR = '#FAB913';
const DEFAULT_TIME_TXT_COLOR = '#000';
const DEFAULT_DIGIT_TXT_COLOR = '#000';
const DEFAULT_TIME_TO_SHOW = ['D', 'H', 'M', 'S'];

class CountDown extends React.Component {
  static propTypes = {
    time: PropTypes.number,
    until: PropTypes.number,
    onFinish: PropTypes.func,
    size: PropTypes.number,
    digitBgColor: PropTypes.string,
    digitTxtColor: PropTypes.string,
    timeTxtColor: PropTypes.string,
    timeToShow: PropTypes.array,
    onPress: PropTypes.func,
  };

  state = {
    time: 0,
    until: 0,
    wentBackgroundAt: null,
  };

  componentDidMount() {
    if (this.props.onFinish) {
      this.onFinish = this.props.onFinish;
    }
    this.timer = setInterval(this.updateTimer, 1000);
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      time: nextProps.time,
      until: nextProps.until,
    });
  }

  _handleAppStateChange = currentAppState => {
    const { time, wentBackgroundAt } = this.state;
    if (currentAppState === 'active' && wentBackgroundAt) {
      const diff = (Date.now() - wentBackgroundAt) / 1000.0;
      this.setState({ time: Math.max(0, time - diff) });
    }
    if (currentAppState === 'background') {
      this.setState({ wentBackgroundAt: Date.now() });
    }
  }

  getTimeLeft = () => {
    const { time } = this.state;
    return {
      seconds: time % 60,
      minutes: parseInt(time / 60, 10) % 60,
      hours: parseInt(time / (60 * 60), 10) % 24,
      days: parseInt(time / (60 * 60 * 24), 10),
    };
  };

  updateTimer = () => {
    const { time, until } = this.state;
    if (time >= until) {
      clearInterval(this.timer);
      this.onFinish();
    }else {
      if (this.props.play) {
        this.setState({ time: time + 1 });
        this.props.updateTime(time + 1);
        return;
      }
    }
  };

  renderDigit = (d) => {
    const { digitBgColor, digitTxtColor, size } = this.props;
    return (
      <View style={[
        styles.digitCont,
        { backgroundColor: digitBgColor },
        { width: size * 2.3, height: size * 2.6 },
      ]}>
        <Text style={[
          styles.digitTxt,
          { fontSize: size },
          { color: digitTxtColor }
        ]}>
          {d}
        </Text>
      </View>
    );
  };
  renderDoubleDigits = (label, digits) => {
    const { timeTxtColor, size } = this.props;

    return (
      <View key={label} style={styles.doubleDigitCont}>
        <View style={styles.timeInnerCont}>
          {this.renderDigit(digits)}
        </View>
        <Text style={[
          styles.timeTxt,
          { fontSize: size / 1.8 },
          { color: timeTxtColor },
        ]}>
          {label}
        </Text>
      </View>
    );
  };

  renderCountDown = () => {
    const { timeToShow } = this.props;
    const { time } = this.state;
    const { days, hours, minutes, seconds } = this.getTimeLeft();
    const newTime = sprintf('%02d-%02d-%02d-%02d', days, hours, minutes, seconds).split('-');
    const Component = this.props.onPress ? TouchableOpacity : View;

    return (
      <Component
        style={styles.timeCont}
        onPress={this.props.onPress}
      >
        {_.includes(timeToShow, 'D') ? this.renderDoubleDigits(this.props['labelD'], newTime[0]) : null}
        {_.includes(timeToShow, 'H') ? this.renderDoubleDigits(this.props['labelH'], newTime[1]) : null}
        {_.includes(timeToShow, 'M') ? this.renderDoubleDigits(this.props['labelM'], ":" + newTime[2] + ":") : null}
        {_.includes(timeToShow, 'S') ? this.renderDoubleDigits(this.props['labelS'], newTime[3]) : null}
      </Component>
    );
  };

  render() {
    return (
      <View style={this.props.style}>
        {this.renderCountDown()}
      </View>
    );
  }
}

CountDown.defaultProps = {
  digitBgColor: DEFAULT_BG_COLOR,
  digitTxtColor: DEFAULT_DIGIT_TXT_COLOR,
  timeTxtColor: DEFAULT_TIME_TXT_COLOR,
  timeToShow: DEFAULT_TIME_TO_SHOW,
  labelD: "Days",
  labelH: "Hours",
  labelM: "Minutes",
  labelS: "Seconds",
  time: 0,
  size: 15,
};

const styles = StyleSheet.create({
  timeCont: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  timeTxt: {
    color: 'white',
    backgroundColor: 'transparent',
  },
  timeInnerCont: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitCont: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doubleDigitCont: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitTxt: {
    color: 'white',
    fontWeight: '600',
  },
});

module.exports = CountDown;
