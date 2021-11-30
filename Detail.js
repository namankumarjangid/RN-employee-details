import React, { useEffect } from 'react';
import { StyleSheet, Text, SafeAreaView, ScrollView, FlatList, View, Image, ToastAndroid } from 'react-native';
import { NativeBaseProvider, Radio } from "native-base"
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-datepicker'
import Moment from 'moment';

function Details({ navigation }) {
  const [loader, setLoader] = React.useState(true)
  const [testValue, setTestValue] = React.useState([]);
  const [date, setDate] = React.useState(new Date())


  useEffect(() => {
    retrieveData();
  }, [testValue]);


  const retrieveData = async () => {
    try {
      let valueString = await AsyncStorage.getItem('userData');
      setTestValue(JSON.parse(valueString));
      setLoader(false);
    } catch (error) {
      console.log(error);
    }
  };
  const onPress = async (value, index) => {
    const formatDate = Moment(date).format('MM-DD-YYYY');
    let newValues = testValue;
    let checkifTodayDataExists = false;
    if (newValues[index] && newValues[index]['attendance']) {
      checkifTodayDataExists = newValues[index]['attendance'].some(element => {
        return element.date === formatDate
      });
    }

    if (checkifTodayDataExists) {
      newValues[index]['attendance'].map(attendanceDate => {
        if (attendanceDate.date === formatDate) {
          attendanceDate.attendance = value
        }
      })
    } else {
      newValues[index]['attendance'].push({
        "attendance": value,
        "date": formatDate
      })
    }

    AsyncStorage.setItem('userData', JSON.stringify(newValues));
    ToastAndroid.showWithGravity(
      "Attendance Saved",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  }
  const setEmpDate = (val) => {
    setTestValue([])
    setDate(val)
  }
  return (
    <ScrollView style={styles.container}>
      <SafeAreaView >
        {loader ?
            <View style={styles.tinyImage}>
              <Image
                style={styles.tinyLogo}
                source={require('./assets/Spin.gif')}
              />
            </View> :
            <View>
              <DatePicker
                style={{ width: 200 }}
                date={date}
                mode="date"
                placeholder="select date"
                format="YYYY-MM-DD"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                customStyles={{
                  dateIcon: {
                    position: 'absolute',
                    left: 0,
                    top: 4,
                    marginLeft: 0
                  },
                  dateInput: {
                    marginLeft: 36
                  }
                }}
                onDateChange={(date) => { setEmpDate(date) }}
              />
              <FlatList
                data={testValue}
                renderItem={({ item, index }) => (
                  <View>
                    <Text style={styles.title}>Name: {item.name}</Text>
                    <NativeBaseProvider>
                      <Radio.Group
                        name="myRadioGroup"
                        accessibilityLabel="favorite number"
                        onChange={(value) => {
                          onPress(value, index)
                        }}
                        style={styles.subText}
                      >
                        <Radio value="Present" >
                          Present
                        </Radio>
                        <Radio value="Absent" >
                          Absent
                        </Radio>
                        <Radio value="Half day" >
                          Half day
                        </Radio>
                      </Radio.Group>
                    </NativeBaseProvider>
                  </View>

                )}
                keyExtractor={(item, index) => index.toString()}
              />
            </View>
        }
      </SafeAreaView>
    </ScrollView >
  )
}

export default Details
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 10,
    paddingTop: 2,
    paddingBottom: 2,
    backgroundColor: '#000',
    color: '#ffffff'
  },
  subText: {
    fontSize: 18,
    marginLeft: 10
  },
  tinyImage: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
  },
  tinyLogo: {
    width: 50,
    height: 50
  },
});