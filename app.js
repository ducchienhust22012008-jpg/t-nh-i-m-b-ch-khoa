import {calculate,grades} from './calculator.js';
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2}).format(n);
const gradeOf=n=>grades.find(g=>n>=g[1])[0];
$('targets').innerHTML=grades.filter(g=>g[0]!=='F').map(g=>`<label><input type="radio" name="target" value="${g[0]}" ${g[0]==='A'?'checked':''}><span>${g[0]}</span></label>`).join('');
document.querySelector('.quiz-blocks').innerHTML=Array.from({length:10},(_,i)=>`<button type="button" data-quiz="${i+1}" title="${i+1} bài đạt" aria-label="Chọn ${i+1} bài đạt"></button>`).join('');
$('grade-table').innerHTML=grades.map((g,i)=>`<tr><td><strong>${g[0]}</strong></td><td>${i===0?'9,0 – 10,0':g[0]==='F'?'Dưới 4,0':`${fmt(g[1])} đến dưới ${fmt(grades[i-1][1])}`}</td><td>${fmt(g[2])}</td><td>${g[3]}</td></tr>`).join('');
let latest;
function update(){
 const a=$('absences'),q=$('quizzes'),m=$('midterm');
 const state={absences:a.value===''?NaN:Number(a.value),activity:Number(document.querySelector('[name=activity]:checked').value),quizzes:q.value===''?NaN:Number(q.value),midterm:m.value===''?NaN:Number(m.value),hasMidterm:$('has-midterm').checked,target:document.querySelector('[name=target]:checked').value};
 m.disabled=!state.hasMidterm;
 if(!state.hasMidterm)state.midterm=0;
 try{
  const r=calculate(state);latest=r;$('error').hidden=true;
  $('attendance-hint').textContent=`${state.absences===0?'Không vắng':`Vắng ${state.absences} buổi`}: ${r.attendance>0?'+':''}${r.attendance} điểm chuyên cần`;
  document.querySelector('[data-step="-1"]').disabled=state.absences===0;
  document.querySelectorAll('[data-quiz]').forEach(b=>{const filled=Number(b.dataset.quiz)<=state.quizzes;b.classList.toggle('filled',filled);b.setAttribute('aria-pressed',Number(b.dataset.quiz)===state.quizzes?'true':'false');});
  $('target-hint').textContent=`${state.target} · Điểm học phần từ ${fmt(r.threshold)}`;
  $('goal-title').textContent=`ĐỂ ĐẠT MỤC TIÊU ${state.target}`;
  $('required').textContent=r.required===null?'—':fmt(r.required);
  $('score-unit').hidden=r.required===null;
  $('result-title').textContent=r.reason?'Chưa thể đạt mục tiêu':'Cuối kỳ cần ít nhất';
  $('status').textContent=r.reason||'✓ Có thể đạt được';$('status').classList.toggle('warning',!!r.reason);
  $('process').textContent=state.hasMidterm?fmt(r.process):'—';
  $('total-label').textContent=r.required===null?'Điểm học phần tối đa':'Điểm học phần dự kiến';
  $('total').textContent=!state.hasMidterm?'—':r.process<3?'Không đạt':r.required===null?`${fmt(r.maximum)} · ${gradeOf(r.maximum)}`:`${fmt(r.total)} · ${gradeOf(r.total)}`;
  $('result-note').textContent=!state.hasMidterm?'Cần có bài kiểm tra giữa kỳ để đủ điều kiện qua môn.':r.process<3?'ĐQT phải đạt từ 3; điểm cuối kỳ không thể bù điều kiện này.':r.required===null?'Dù cuối kỳ đạt 10, điểm học phần vẫn thấp hơn mục tiêu. Hãy thử chọn mục tiêu thấp hơn.':'Kết quả theo bước điểm cuối kỳ 0,5. ĐHP không làm tròn.';
  $('marker').hidden=r.required===null;$('marker').style.left=`${(r.required??0)*10}%`;$('marker').querySelector('b').textContent=fmt(r.required??0);
  $('b-attendance').textContent=`${fmt(r.attendance)} + ${fmt(state.activity)} = ${fmt(r.attendance+state.activity)}`;
  $('b-quizzes').textContent=`0,2 × ${state.quizzes} = ${fmt(.2*state.quizzes)}`;
  $('b-midterm').textContent=state.hasMidterm?`0,2 × ${fmt(state.midterm)} = ${fmt(.2*state.midterm)}`:'Chưa có bài giữa kỳ';
  $('b-raw').textContent=state.hasMidterm?fmt(r.raw):'—';$('b-process').textContent=state.hasMidterm?fmt(r.process):'—';
 }catch{
  $('error').hidden=false;$('error').textContent='Nhập số buổi vắng là số nguyên ≥ 0, số bài đạt từ 0–10, điểm giữa kỳ từ 0–30.';
  $('required').textContent='—';$('score-unit').hidden=true;$('result-title').textContent='Kiểm tra thông tin nhập';$('status').textContent='Chưa đủ dữ liệu hợp lệ';$('status').classList.add('warning');$('process').textContent='—';$('total').textContent='—';$('marker').hidden=true;$('result-note').textContent='Sửa các giá trị nhập để xem kết quả.';
  for(const id of ['b-attendance','b-quizzes','b-midterm','b-raw','b-process'])$(id).textContent='—';
 }
}
$('form').addEventListener('input',update);$('form').addEventListener('change',update);$('form').addEventListener('submit',e=>e.preventDefault());
document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{const n=Number($('absences').value);$('absences').value=Math.max(0,(Number.isFinite(n)?Math.floor(n):0)+Number(b.dataset.step));update();}));
document.querySelectorAll('[data-quiz]').forEach(b=>b.addEventListener('click',()=>{$('quizzes').value=Number(b.dataset.quiz)===Number($('quizzes').value)?0:b.dataset.quiz;update();}));
$('reset').addEventListener('click',()=>{$('form').reset();update();});
document.querySelectorAll('[data-dialog]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.dialog).showModal()));
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});});
update();
