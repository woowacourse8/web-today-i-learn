# DB - 실습

## DDL 실습

### 문제 1: 테이블 생성하기

1. `attendance` 테이블은 중복된 데이터가 쌓이는 구조다. 중복된 데이터는 어떤 컬럼인가?
   - id와 nickname이 있는 컬럼이다.
2. `attendance` 테이블에서 중복을 제거하기 위해 `crew` 테이블을 만들려고 한다. 어떻게 구성해 볼 수 있을까?
   - id와 nickname
3. `crew` 테이블에 들어가야 할 크루들의 정보는 어떻게 추출할까? (hint: DISTINCT)
  ```sql
  SELECT DISTINCT crew_id, nickname
  FROM attendance;
  ```
4. 최종적으로 crew 테이블 생성
```sql
CREATE TABLE crew (
  `crew_id` INT NOT NULL,
  `nickname` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`crew_id`)
);
```
5. attendance 테이블에서 크루 정보를 추출해서 crew 테이블에 삽입하기
```sql
INSERT INTO crew (crew_id, nickname)
SELECT DISTINCT crew_id, nickname
FROM attendance;
```

### 문제 2: 테이블 컬럼 삭제하기
1. crew 테이블을 만들고 중복을 제거했다. attendance에서 불필요해지는 컬럼은?
  - nickname 이 불필요.
2. 컬럼을 삭제하려면 어떻게 해야 하는가?
```sql
ALTER TABLE attendance
DROP COLUMN nickname;
```

### 문제 3: 외래키 설정하기
```sql
ALTER TABLE attendance 
ADD FOREIGN KEY (crew_id) 
REFERENCES crew(crew_id);
```

### 문제 4: 유니크 키 설정
```sql
ALTER TABLE crew
ADD UNIQUE (nickname);
```

## DML (CRUD) 실습

### 문제 5: 크루 닉네임 검색하기
```sql
SELECT nickname
FROM crew
WHERE nickname LIKE '디%';
```

### 문제 6: 출석 기록 확인하기
```sql
SELECT crew_id
FROM crew
WHERE nickname LIKE '어셔';
```
-> '어셔' 라는 crew_id 가 없음.

### 문제 7: 누락된 출석 기록 추가
```sql
INSERT INTO crew (crew_id, nickname)
VALUES (13, '어셔');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time)
VALUES (13, '2025-03-06', '09:31', '18:01');
```

### 문제 8: 잘못된 출석 기록 수정
```sql
INSERT INTO crew (crew_id, nickname) 
VALUES (14, '주니');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time) 
VALUES (14, '2025-03-12', '10:05', '18:00'); 

UPDATE attendance
SET start_time = '10:00'
WHERE crew_id = 14 AND attendance_date = '2025-03-12';
```

### 문제 9: 허위 출석 기록 삭제
```sql
INSERT INTO crew (crew_id, nickname) 
VALUES (15, '아론');

INSERT INTO attendance (crew_id, attendance_date, start_time, end_time) 
VALUES (15, '2025-03-12', '10:00', '18:00'); 

DELETE FROM attendance
WHERE crew_id = 15 AND attendance_date = '2025-03-12';
```

### 문제 10: 출석 정보 조회하기
```sql
SELECT c.nickname, a.attendance_date, a.start_time, a.end_time
FROM crew AS c
INNER JOIN attendance AS a ON c.crew_id = a.crew_id;
```

### 문제 11: nickname으로 쿼리 처리하기
```sql
SELECT * FROM attendance 
WHERE crew_id = ( SELECT crew_id FROM crew WHERE nickname = '검프' );
```

### 문제 12: 가장 늦게 하교한 크루 찾기
```sql
SELECT c.nickname, a.end_time
FROM crew AS c
INNER JOIN attendance AS a ON c.crew_id = a.crew_id
WHERE a.attendance_date = '2025-03-05'
ORDER BY a.end_time DESC
LIMIT 1;
```

## 집계 함수 실습

### 문제 13: 크루별로 '기록된' 날짜 수 조회
```sql
SELECT crew_id, COUNT(attendance_date)
FROM attendance
GROUP BY crew_id;
```

### 문제 14: 크루별로 등교 기록이 있는 (start_time IS NOT NULL) 날짜 수 조회
```sql
SELECT crew_id, COUNT(attendance_date)
FROM attendance
WHERE start_time IS NOT NULL 
GROUP BY crew_id;
```

### 문제 15: 날짜별로 등교한 크루 수 조회
```sql
SELECT attendance_date, COUNT(crew_id)
FROM attendance
GROUP BY attendance_date;
```

### 문제 16: 크루별 가장 빠른 등교 시각(MIN)과 가장 늦은 등교 시각(MAX)
```sql
SELECT crew_id, MIN(start_time), MAX(end_time)
FROM attendance
GROUP BY crew_id;
```

## 🧐 생각해 보기 (Conceptual Study)

SQL 실습을 진행하며 학습한 데이터베이스의 핵심 개념들을 정리합니다.

---

### 1. SQL 실습 관련

* **기본키(Primary Key)란 무엇이고 왜 필요한가요?**
    * 테이블 내의 모든 행을 유일하게 식별할 수 있는 고유한 값입니다.
    * **중복 방지:** 데이터가 겹치지 않게 보장하여 특정 데이터를 정확히 찾아내거나 수정, 삭제할 때 혼선을 방지합니다.
* **MySQL의 `AUTO_INCREMENT`는 왜 필요한가요?**
    * 기본키 값을 매번 사람이 직접 입력하는 수고를 덜어줍니다.
    * DB가 자동으로 순차적인 번호를 부여함으로써 번호 중복 실수를 원천 차단하고 관리를 자동화합니다.
* **`end_time`이 `NULL`일 때 주의할 점은 무엇인가요?**
    * SQL에서 `NULL`은 **'알 수 없음(Unknown)'**을 뜻합니다. 산술 연산이나 비교 연산 시 결과가 항상 `NULL`이 되므로, 비즈니스 로직에서 '미하교' 혹은 '기록 누락' 등으로 치환하는 처리가 필요합니다.
* **`crew`와 `attendance` 테이블의 관계를 비유해 본다면? (ERD)**
    * **1:N (일대다) 관계**입니다.
    * **비유:** '작가와 원고' 관계와 같습니다. 작가 한 명이 여러 편의 원고를 쓸 수 있지만, 한 편의 원고는 보통 한 명의 작가에게 귀속되는 것과 같은 원리입니다.

---

### 2. DB 개념 연결

* **동시에 100명이 등교 버튼을 누른다면? (트랜잭션과 ACID)**
    * **원자성(Atomicity)**과 **격리성(Isolation)**이 핵심입니다. 100개의 요청이 동시에 들어와도 각각의 트랜잭션이 독립적으로 처리되어 데이터가 꼬이거나 유실되지 않도록 보장해야 합니다.
* **왜 파일(CSV)이 아닌 데이터베이스를 사용해야 할까요?**
    * 파일은 여러 사람이 동시에 수정할 때 데이터가 깨질 위험이 큽니다. 반면 DB는 **동시성 제어, 보안, 대용량 데이터 검색(Indexing)** 면에서 압도적으로 효율적이고 안전합니다.
* **NoSQL(MongoDB)로 이 데이터를 저장한다면 어떤 차이가 있을까요?**
    * 테이블을 나누지 않고 **문서(Document)** 하나에 크루 정보와 출석 배열을 한꺼번에 담을 수 있습니다. 조인(JOIN) 없이 빠르게 읽을 수 있지만, 통계 작업이나 데이터 일관성 유지가 RDBMS보다 까다로울 수 있습니다.

---

### 3. 더 생각해 보기 (심화)

* **왜 `nickname`을 기본키로 설정하지 않았을까요?**
    * 닉네임은 나중에 변경될 가능성이 있기 때문입니다. 기본키는 **불변성**이 중요한데, 비즈니스 의미가 없는 `crew_id`를 사용하면 닉네임이 바뀌어도 데이터 관계를 안정적으로 유지할 수 있습니다.
* **`RESTRICT`와 `CASCADE` 제약 조건의 차이는?**
    * **RESTRICT:** 참조하는 데이터(출석 기록)가 남아있으면 원본(크루)을 삭제하지 못하게 막습니다.
    * **CASCADE:** 원본(크루)이 삭제되면 그에 딸린 모든 데이터(출석 기록)를 함께 자동 삭제합니다.
* **서브쿼리(Subquery)와 조인(JOIN)의 성능 차이는?**
    * 일반적으로 현대의 DB 옵티마이저는 **JOIN**을 더 효율적으로 처리합니다. 데이터 양이 많아질수록 JOIN이 성능상 유리한 경우가 많으므로 권장되는 방식입니다.
* **정규화(Normalization)의 장단점은?**
    * **장점:** 데이터 중복을 제거해 저장 공간을 아끼고 이상 현상(Anomaly)을 방지합니다.
    * **단점:** 데이터를 조회할 때 여러 테이블을 합쳐야(JOIN) 하므로 조회 성능이 다소 저하될 수 있습니다.
* **연결 풀링(Connection Pooling)이란 무엇인가요?**
    * DB 접속은 비용이 큰 작업입니다. 미리 여러 개의 연결 통로를 만들어 두고(Pool), 필요할 때마다 빌려주고 반납받는 방식을 통해 서버의 부하를 줄이고 성능을 높이는 기
