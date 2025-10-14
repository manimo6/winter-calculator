// refactored/js/main.js

// 애플리케이션의 진입점(Entry Point) 역할을 합니다.
// 문서가 로드되면 UI를 초기화하고 이벤트 리스너를 설정합니다.

$(document).ready(function() {
  // 초기 UI 렌더링
  renderCourseTreeMenu();
  applySelect2ToDuration();
  
  // 전역 datepicker 설정
  $.datepicker.setDefaults({
    dateFormat: 'yy-mm-dd',
    prevText: '이전 달',
    nextText: '다음 달',
    monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
    monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
    dayNames: ['일','월','화','수','목','금','토'],
    dayNamesShort: ['일','월','화','수','목','금','토'],
    dayNamesMin: ['일','월','화','수','목','금','토'],
    showMonthAfterYear: true,
    yearSuffix: '년'
  });

  // 이벤트 리스너 설정
  setupEventListeners();

  // 초기 상태값 설정
  updateState({
    discount: parseFloat($('#discount').val())
  });

  // 잔상 제거 트릭을 위한 최종 표시
  document.body.style.opacity = 1;
});
