export const grades = [
  ['A+',9,4,'Xuất sắc'],['A',8.5,4,'Giỏi'],['B+',8,3.5,'Khá giỏi'],['B',7,3,'Khá'],
  ['C+',6.5,2.5,'Trung bình khá'],['C',5.5,2,'Trung bình'],['D+',5,1.5,'Trung bình yếu'],['D',4,1,'Đạt mức tối thiểu'],['F',0,0,'Không đạt']
];
export const roundHalf = value => Math.round((value + Number.EPSILON) * 2) / 2;
export function calculate({absences,activity,quizzes,midterm,hasMidterm,target}) {
  if (!Number.isInteger(absences)||absences<0||![0,.5,1].includes(activity)||!Number.isInteger(quizzes)||quizzes<0||quizzes>10||!Number.isFinite(midterm)||midterm<0||midterm>30||!grades.some(g=>g[0]===target&&g[0]!=='F')) throw new Error('Vui lòng nhập số liệu hợp lệ.');
  const attendance = absences===0?1:absences<=2?0:absences<=4?-1:-2;
  const raw=attendance+activity+.2*quizzes+.2*midterm;
  const process=roundHalf(raw);
  const threshold=grades.find(g=>g[0]===target)[1];
  const maximum=(process+10)/2;
  let required=null;
  if(hasMidterm&&process>=3) for(let exam=3;exam<=10;exam+=.5) if((process+exam)/2>=threshold){required=exam;break;}
  const reason=!hasMidterm?'Chưa có bài kiểm tra giữa kỳ':process<3?'Điểm quá trình dưới 3':required===null?'Mục tiêu vượt mức có thể đạt':null;
  return {attendance,raw,process,threshold,maximum,required,reason,total:required===null?null:(process+required)/2};
}
