import React, { useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, ToastAndroid, FlatList, PermissionsAndroid, Keyboard } from 'react-native'
import { TextInput, Button } from 'react-native-paper';
import { NavigationContainer, useScrollToTop } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Details from './Detail'
import EmpData from './EmpDetail'
import Contacts from 'react-native-contacts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


function EmployeeScreen({ navigation, route }) {
  const [text, onChangeText] = React.useState('');
  const [number, onChangeNumber] = React.useState('');
  const [attendance, onChangeAttend] = React.useState([]);

  useEffect(() => {
    if (route.params) {
      onChangeText(route.params.name)
      onChangeNumber(route.params.number)
    }
  }, [route])

  const onPress = async () => {
    Keyboard.dismiss()
    if (text && number) {
      let employeeData = {
        name: text,
        contact: number,
        attendance: attendance
      }
      try {
        let userData = await AsyncStorage.getItem('userData');
        let newArr = [];
        if (!userData) {
          userData = [];
          newArr.push(employeeData)
          await AsyncStorage.setItem('userData', JSON.stringify(newArr));
          onChangeText('')
          onChangeNumber('')
          navigation.navigate('Details')
        }
        else {
          const existData = JSON.parse(userData).some(item => text === item.name);
          if (!existData) {
            newArr = [...JSON.parse(userData), employeeData]
            await AsyncStorage.setItem('userData', JSON.stringify(newArr));
            onChangeText('')
            onChangeNumber('')
            ToastAndroid.showWithGravity(
              "Employee Detail Saved",
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            );
            navigation.navigate('Details')
          }
          else {
            Alert.alert('This employee already exist')
          }
        }
      }
      catch (e) {
        Alert.alert('Error: ', e)
      }
    } else {
      Alert.alert('Simple Button pressed')
    }
  }
  const showFirstContactAsync = () => {
    navigation.navigate('Contact Screen')
  }
  const showData = async () => {
    try {
      navigation.navigate('Employee Data')
    }
    catch (e) {
      Alert.alert(e)
    }
  }
  return (
    <KeyboardAwareScrollView bounces={false}
      keyboardShouldPersistTaps='handled'
      showsVerticalScrollIndicator={false} >
      <View style={{ overflow: 'hidden', paddingBottom: 5 }}>
        <View style={[styles.headerTitle, {
          backgroundColor: '#fff',
          shadowColor: '#000',
          shadowOffset: { width: 1, height: 1 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 15
        }]}>
          <Text style={styles.hTitle}>Employee Screen</Text>
          <TouchableOpacity onPress={() => showFirstContactAsync()}>
            <Image
              style={styles.tinyLogo}
              source={require('./assets/contact.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TextInput
        style={styles.text}
        label="Name"
        value={text}
        onChangeText={onChangeText}
      />
      <TextInput
        style={styles.text}
        label="Contact"
        value={number}
        onChangeText={onChangeNumber}
        keyboardType="number-pad"
      />
      <Button mode="contained" onPress={() => onPress()}>
        Save
      </Button>
      <View style={styles.buttonBlock}>
      <Button style={styles.button} onPress={showData}>
        Show Employee
      </Button>
      <Button style={styles.button} onPress={() => { navigation.navigate('Details') }}>
        Update Employee
      </Button>
      </View>
    </KeyboardAwareScrollView >
  );
}

function ContactScreen({ navigation }) {
  const ref = React.useRef(null);
  const [contacts, setContacts] = React.useState([]);
  const [searchText, setSearchText] = React.useState();
  const [contactArray, ArrayHolder] = React.useState();


  useScrollToTop(ref);

  useEffect(() => {
    getContactBook()
  }, [])

  getContactBook = () => {

    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        'title': 'Contacts',
        'message': 'This app would like to view your contacts.'
      }
    ).then(() => {
      Contacts.getAll((err, contacts) => {
        if (err === 'denied') {
          console.warn('err')
        } else {
          const dataC = contacts.map(con => {
            const contactData = {
              name: con.givenName,
              number: con.phoneNumbers && con.phoneNumbers.length > 0 ? con.phoneNumbers[0].number : ''
            }
            return contactData
          })
          const ascData = dataC.sort((a, b) => a.name > b.name)
          setContacts(ascData)
          ArrayHolder(ascData)
        }
      })
    })
      .catch((err) => {
        console.warn(err);
      })
  }

  const searchValue = (searchText) => {
    if (searchText) {
      const newData = contactArray.filter(item => {
        const itemData = item.name.toLowerCase() ? item.name.toLowerCase() : ''
        return itemData.indexOf(searchText.toLowerCase()) > -1
      })
      setSearchText(searchText)
      setContacts(newData)
    } else {
      setSearchText(searchText)
      setContacts(contactArray)
    }
  }
  let colors = ['#123456', '#654321', '#612345', '#111111', '#abcdef'];
  return (
    <ScrollView ref={ref}>
      <SafeAreaView>
        <TextInput
          style={styles.text}
          placeholder="Search Name"
          value={searchText}
          onChangeText={searchValue}
        />
        <FlatList
          data={contacts}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => { navigation.navigate('Employee Screen', item) }} style={styles.contactTextSection}>
              <Text style={[styles.contactLetter, { backgroundColor: colors[index % colors.length] }]}>{item.name.charAt(0)}</Text>
              <View>
                <Text style={styles.contactText}>{item.name}</Text>
                <Text style={styles.contactText}>{item.number}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </SafeAreaView>
    </ScrollView>
  )
}
const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Employee Screen" component={EmployeeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Contact Screen" component={ContactScreen} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Employee Data" component={EmpData} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    top: 50
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#ccc'
  },
  buttonBlock: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  headerTitle: {
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 10
  },
  hTitle: {
    fontSize: 20,
    textAlign: 'left',
    padding: 20,
    width: '85%',
    color: '#000'
  },
  tinyLogo: {
    width: 45,
    height: 45,
    marginTop: 10
  },
  title: {
    fontSize: 25,
    marginBottom: 20,
    textAlign: 'center'
  },
  text: {
    fontSize: 18,
    marginBottom: 20
  },
  contactTextSection: {
    padding: 20,
    borderBottomColor: '#ccc',
    borderBottomWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 20,
    color: '#000'
  },
  contactLetter: {
    color: '#ccc',
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
    borderRadius: 100,
    width: 50,
    marginRight: 5,
    fontSize: 20
  }
});