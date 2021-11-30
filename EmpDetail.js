import React, { useEffect, useState } from 'react'
import { Text, Alert, SafeAreaView, FlatList, View, StyleSheet } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-native-datepicker'
import Moment from 'moment';

export default function empDetail() {
    const [data, setData] = useState()
    const [date, setDate] = React.useState(new Date())

    useEffect(() => {
        setEmpDate(date);
    }, [date]);

    const renderData = ({ item, index }) => (
        <View style={[style.textSection, { backgroundColor: index % 2 === 0 ? '#bbb' : '#ddd' }]}>
            <Text style={style.text}>Name: {item.name}</Text>
            <Text style={style.text}>Contact: {item.contact}</Text>
            <Text style={style.text}>Date: {item.date}</Text>
            <Text style={style.text}>Attendance: {item.attendance}</Text>
        </View>
    )
    const setEmpDate = async (val) => {
        const formatDate = Moment(val).format('MM-DD-YYYY');
        let newArr = []
        let newData = {}
        const emp = await AsyncStorage.getItem('userData')
        const empData = JSON.parse(emp).map(item => {
            if (item.attendance && item.attendance.length > 0) {
                item.attendance.map(d => {
                    if (d.date === formatDate) {
                        newData = {
                            name: item.name,
                            contact: item.contact,
                            date: d.date,
                            attendance: d.attendance
                        }
                        newArr.push(newData)
                    }
                })
            }
        })
        setData(newArr)
        setDate(val)
    }

    return (
        <SafeAreaView>
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
            </View>
            <FlatList
                data={data}
                renderItem={renderData}
                keyExtractor={item => item.name}
            />
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    text: {
        fontSize: 20,
        color: '#000'
    },
    textSection: {
        padding: 12,
        margin: 10,
        borderRadius: 15
    }
})