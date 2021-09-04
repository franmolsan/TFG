// DiaryEntry class
class DiaryEntry {
  final String ID ;
  final String date;
  final String time;
  final String desc;

  DiaryEntry(this.ID, this.date, this.time, this.desc);

  DiaryEntry.fromJson(Map<String, dynamic> json)
      : ID = json['entryID'],
        desc = json['desc'],
        time = json['time'],
        date = json['date'];

  @override
  String toString() {
     return "Día ${date}, Hora: ${time}, Desc: ${desc} ";
  }

  String title(){
    return "Día ${date}, Hora: ${time}";
  }

}