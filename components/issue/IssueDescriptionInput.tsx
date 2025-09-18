import React from "react";
import { TextInput, StyleSheet,Text , View} from "react-native";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function IssueDescriptionInput({ value, onChange }: Props) {
  return (
    <View>
    <Text style={{fontWeight:"bold"}}>Description</Text>
    <TextInput
      style={styles.input}
      placeholder="Describe your issue"
      value={value}
      onChangeText={onChange}
      multiline={true}
    />
    </View>

  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 6,
    marginVertical: 10,
  },
});
