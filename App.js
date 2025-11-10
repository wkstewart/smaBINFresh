import {useState} from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import {Alert, Text, View, SafeAreaView, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Home from './Home';
import Help from './Help';
import About from './About';

const binBlue = '#2171b5';
const activeColor = 'white';
const inactiveColor = 'lightgray';

const Tab = createBottomTabNavigator();

export default function App() {
  const theme = useColorScheme();

  return (
  <>
  <SafeAreaView style={{flex: 1}}>
    <NavigationContainer>
       <Tab.Navigator>
          <Tab.Screen name='Leita'
            component={Home}
            options={{ tabBarLabel: 'Leita',
              headerShown: false,
              headerStyle: { backgroundColor: binBlue, },
              tabBarStyle: { backgroundColor: binBlue, },
              headerTitleStyle: { color: 'white' },
              tabBarShowLabel: false,
              tabBarIcon: ({ color, size, focused }) => (
                <Icon name="home" color={focused ? activeColor : inactiveColor} size={24} />
              ),
              tabBarOptions: {
                activeTintColor: 'white',
                inactiveTintColor: inactiveColor,
                activeBackgroundColor: binBlue,
                inactiveBackgroundColor: binBlue,
              }
            }}
          />
          <Tab.Screen name="BÍN-kjarninn - Hjálp"
             component={Help}
             options={{ tabBarLabel: 'Hjálp',
                        headerShown: false,
                        headerStyle: { backgroundColor: binBlue, },
                        tabBarStyle: { backgroundColor: binBlue, },
                        headerTitleStyle: { color: 'white' },
                        tabBarShowLabel: false,
                        tabBarIcon: ({ color, size, focused }) => (
                          <Icon name="help-circle" color={focused ? activeColor : inactiveColor} size={28} />
                        ),
             }}
          />
          <Tab.Screen name="Um"
             component={About}
             options={{ tabBarLabel: '',
                        headerShown: false,
                        headerStyle: { backgroundColor: binBlue, },
                        tabBarStyle: { backgroundColor: binBlue, },
                        headerTitleStyle: { color: 'white' },
                        tabBarShowLabel: false,
                        tabBarIcon: ({ color, size, focused }) => (
                          <Icon name="information-circle" color={focused ? activeColor : inactiveColor} size={28} />
                        ),
             }}
          />
       </Tab.Navigator>
    </NavigationContainer>
  </SafeAreaView>
    </>
  );
}