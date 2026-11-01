export type RichColor =
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "gray_background"
  | "brown_background"
  | "orange_background"
  | "yellow_background"
  | "green_background"
  | "blue_background"
  | "purple_background"
  | "pink_background"
  | "red_background"
  | "default_background";

export type RichSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: RichColor;
  href?: string;
};

export type Piece =
  | { kind: "text"; text: string; spans?: RichSpan[] }
  | { kind: "bullet"; text: string; spans?: RichSpan[] }
  | { kind: "code"; lang: string; code: string };

export type EntryLink = {
  href: string;
  label: string;
};

export type Entry = {
  id: string;
  stamp: string;
  problem: string;
  lang: string;
  links: EntryLink[];
  pieces: Piece[];
};

export const entries: Entry[] = [
  {
    id: "20261101",
    stamp: "20261101",
    problem: "데이터 분석",
    lang: "Java",
    links: [
      {
        href: "https://school.programmers.co.kr/learn/courses/30/lessons/250121",
        label: "[PCCE 기출문제] 10번 / 데이터 분석",
      },
    ],
    pieces: [
      {
        kind: "code",
        lang: "Java",
        code: `import java.util.*;

class Solution {
    public int[][] solution(int[][] data, String ext, int val_ext, String sort_by) {
        
        int extIndex = returnIndex(ext);
        int sortIndex = returnIndex(sort_by);
        
        ArrayList<int[]> list = new ArrayList<>();
        
        for (int i = 0; i < data.length; i++) {
            if (data[i][extIndex] < val_ext)
                list.add(data[i]);
        }

        int[][] answer = list.toArray(new int[list.size()][4]);
        
        Arrays.sort(answer, (a, b) -> Integer.compare(a[sortIndex], b[sortIndex]));
        
        return answer;
    }
    
    public int returnIndex(String s)
    {
        switch (s)
        {
            case "code":
                return 0;

            case "date":
                return 1;

            case "maximum":
                return 2;

            case "remain":
                return 3;

        }
        return 0;
    }
}`,
      },
      {
        kind: "text",
        text: "와 내가 이걸 개힘들게 풀었는데 index 뽑는거까진 그렇다고 쳐도 \nC#에 LINQ같은걸로 날먹이 되는구나 개쩐다… 진짜\n공부해둬야지 저거 여튼 개쩌네 ",
      },
      {
        kind: "code",
        lang: "Java",
        code: `import java.util.*;

class Solution {
    public int[][] solution(int[][] data, String ext, int val_ext, String sort_by) {
        List<String> column = List.of("code", "date", "maximum", "remain");

        int extIndex = column.indexOf(ext);
        int sortIndex = column.indexOf(sort_by);

        return Arrays.stream(data)
            .filter(f -> f[extIndex] < val_ext)
            .sorted(Comparator.comparingInt(s -> s[sortIndex]))
            .toArray(int[][]::new);
    }
}`,
      }
    ],
  },
  {
    id: "20260410",
    stamp: "20260410",
    problem: "평균은 넘겠지",
    lang: "Python",
    links: [
      {
        href: "https://www.acmicpc.net/problem/4344",
        label: "[BOJ 4344] 평균은 넘겠지",
      },
    ],
    pieces: [
      {
        kind: "text",
        text: "시험 기간이라서 시험 끝나고 재개하겠음.. 그래도 문제는 풀거",
      },
      {
        kind: "code",
        lang: "Python",
        code: `c = int(input())
scoreArr = [];

for i in range(c):
    scoreArr = list(map(int, input().split()))
    avg = (sum(scoreArr)-scoreArr[0])/scoreArr[0]
    avgStudent = 0

    for j in range(1, len(scoreArr)):
        if(avg < scoreArr[j]):
            avgStudent += 1
    
    print("{:.3f}%".format((avgStudent / scoreArr[0]) * 100))`,
      }
    ],
  },
  {
    id: "20260406",
    stamp: "20260406",
    problem: "더하기 사이클",
    lang: "Python",
    links: [
      {
        href: "https://www.acmicpc.net/problem/1110",
        label: "[BOJ 1110] 더하기 사이클",
      },
    ],
    pieces: [
      {
        kind: "code",
        lang: "Python",
        code: `from operator import concat

n = int(input())
cycle = 0

def Cycle(num:int) -> int:
    rightSum = 0;
    
    if(num < 10):
        rightSum = str(num)
        # concat('0', str(num)[-1:])
    else:
        # rightSum = str(int(str(num)[0]) + int(str(num)[1]))
        rightSum = str(sum(map(int, str(num))))

    global cycle;
    cycle +=1

    return int(concat(str(num)[-1:], rightSum[-1:]))

cur = Cycle(n)

while(n != cur):
    cur = Cycle(cur)
else:
    print(cycle)`,
      },
      {
        kind: "text",
        text: "푼지 좀 돼서 까먹어버림 ㅈㅅ…",
      }
    ],
  },
  {
    id: "20260403",
    stamp: "20260403",
    problem: "시험 감독",
    lang: "C++",
    links: [
      {
        href: "https://www.acmicpc.net/problem/13458",
        label: "[BOJ 13458] 시험 감독",
      },
    ],
    pieces: [
      {
        kind: "text",
        text: "진짜 거의 1년 만에 cpp를 써보았다.",
      },
      {
        kind: "text",
        text: "(총 응시자 수 - 총감독관이 감시할 수 있는 응시자 수*시험장 수) / 부감독관이 감시할 수 있는 응시자 수) \n문제를 보자마자 떠오른 생각이다 위처럼 계산하고 예외 처리 몇 개만 해주면 반복문 없이 되겠는데? 생각했지만 계속 근사치는 나오되, 정확한 답이 나오지 않았다. \n\n이유는 총 응시자 수로 계산할 경우, 총감독관이 감시할 수 있는 인원을 제외한 나머지 응시자 수가 여러 시험장에서 모인 값이 되어버리기 때문이다. 이러면 시험장별로 필요한 부감독관 수를 계산하는 것과 달라진다.",
        spans: [
          { text: "(", bold: true, color: "gray" },
          { text: "총 응시자 수 - 총감독관이 감시할 수 있는 응시자 수*시험장 수) / 부감독관이 감시할 수 있는 응시자 수)", color: "gray" },
          { text: " \n문제를 보자마자 떠오른 생각이다 위처럼 계산하고 예외 처리 몇 개만 해주면 반복문 없이 되겠는데? 생각했지만 계속 근사치는 나오되, 정확한 답이 나오지 않았다. \n\n이유는 총 응시자 수로 계산할 경우, 총감독관이 감시할 수 있는 인원을 제외한 나머지 응시자 수가 여러 시험장에서 모인 값이 되어버리기 때문이다. 이러면 시험장별로 필요한 부감독관 수를 계산하는 것과 달라진다." },
        ],
      },
      {
        kind: "code",
        lang: "C++",
        code: `#include <iostream>
#include <vector>

using namespace std;

int main()
{
    int n, b, c, answer = 0;
    vector<int> arr(n+1);

    cin >> n;

    for(int i = 0; i < n; i++)
        cin >> arr[i];

    cin >> b >> c;


    for (int i = 0; i < n; i++)
    {
        answer++;

        if(arr[i]%c != 0)
            answer += arr[i]/c + 1;
        else
            answer += arr[i]/c;
    }
    
    cout << answer;

    return 0;
}`,
      },
      {
        kind: "text",
        text: "여기까진 어찌저찌 풀었다. 근데 계속 런타임 에러(1%)가 떴다. 예제 케이스는 모두 통과 했는데 입력이 1000000이라 무슨 일이 벌어진 것 같다고 생각했다. 그래도 잘 모르겠어서 구글링을 했다.",
        spans: [
          { text: "여기까진 어찌저찌 풀었다. 근데 계속 " },
          { text: "런타임 에러(1%)", color: "blue" },
          { text: "가 떴다. 예제 케이스는 모두 통과 했는데 입력이 1000000이라 무슨 일이 벌어진 것 같다고 생각했다. 그래도 잘 모르겠어서 구글링을 했다." },
        ],
      },
      {
        kind: "text",
        text: "먼저 개빡치는 점은 계속 C++23으로 제출했는데 런타임 에러가 계속 떴다. 이유가 안 떠서 원래 안뜨는줄만 알았는데 런타임 에러 이유를 지원하는 게 C++20까지였다. 바로 변경하고 제출했더니 OutOfBounds \n\n질문 게시판에서  www.acmicpc.net <<  이 글의 반례를 입력해보니 입력도 안 끝났는데 에러가 뜨길래 long long int로 바꿔줬다. 이제 입력도 잘 받아 온다.\n\n이제 제출했더니 틀렸습니다.(1%)  \n문득 든 생각인데 음수가 되는 케이스에서 뭔가 이상함을 느꼈다.",
        spans: [
          { text: "먼저 개빡치는 점은 계속 C++23으로 제출했는데 런타임 에러가 계속 떴다. 이유가 안 떠서 원래 안뜨는줄만 알았는데 런타임 에러 이유를 지원하는 게 C++20까지였다. 바로 변경하고 제출했더니 " },
          { text: "OutOfBounds", code: true },
          { text: " \n\n질문 게시판에서  " },
          { text: "www.acmicpc.net", href: "https://www.acmicpc.net/board/view/129272" },
          { text: " <<  이 글의 반례를 입력해보니 입력도 안 끝났는데 에러가 뜨길래 " },
          { text: "long long int", code: true },
          { text: "로 바꿔줬다. 이제 입력도 잘 받아 온다.\n\n이제 제출했더니 " },
          { text: "틀렸습니다.(1%)", color: "red" },
          { text: "  \n문득 든 생각인데 음수가 되는 케이스에서 뭔가 이상함을 느꼈다." },
        ],
      },
      {
        kind: "code",
        lang: "Plain Text",
        code: `5
1 1 1 1 1
1000000 1000000`,
      },
      {
        kind: "text",
        text: "입력이 이렇게 들어오면 5가 되어야 하지 않나? 바로 음수 처리 하는 부분을 추가해줬다.\narr[i] -= b > 0 → (arr[i] -= b) > 0\n이건 말도 안되는 코드였다. 왼쪽처럼 작성해두고 30분 동안 삽질 엄청 했다.",
        spans: [
          { text: "입력이 이렇게 들어오면 5가 되어야 하지 않나? 바로 음수 처리 하는 부분을 추가해줬다.\n" },
          { text: "arr[i] -= b > 0", code: true },
          { text: " → " },
          { text: "(arr[i] -= b) > 0\n", code: true },
          { text: "이건 말도 안되는 코드였다. 왼쪽처럼 작성해두고 30분 동안 삽질 엄청 했다." },
        ],
      },
      {
        kind: "code",
        lang: "C++",
        code: `#include <iostream>
#include <vector>

using namespace std;

int main()
{
    long long int n, b, c, answer = 0;
    vector<int> arr(n+1);

    cin >> n;

    for(int i = 0; i < n; i++)
        cin >> arr[i];

    cin >> b >> c;


    for (int i = 0; i < n; i++)
    {
        answer++;
        if((arr[i] -= b) < 0)
            continue;

        if(arr[i]%c != 0)
            answer += arr[i]/c + 1;
        else
            answer += arr[i]/c;
    }
    
    cout << answer;

    return 0;
}`,
      }
    ],
  },
  {
    id: "20260402",
    stamp: "20260402",
    problem: "소수 단어",
    lang: "Python",
    links: [
      {
        href: "https://www.acmicpc.net/problem/2153",
        label: "[BOJ 2153] 소수 단어",
      },
    ],
    pieces: [
      {
        kind: "text",
        text: "오늘부터 학교 과제는 py, 내가 공부하는 건 cpp로 풀어야겠다. \n근데 과제 푸는데 왜 이렇게 안 풀리지 ",
      },
      {
        kind: "text",
        text: "이 문제도 며칠 전에 풀었던 <싱기한 네자리>와 유사하게 ASC 대신 UTF를 이용하는 문제였다.\n문제를 꼼꼼하게 읽지 않아 1을 소수로 해준다는 것도 처리해주지 않았고,\na=1, A=27로 받는다는 걸 생각하지 않고 계속 ord('a')+1 만 하고 있었다.\n\npy에 str.isupper() 이런 말도 되는 함수가 있길래 이걸로 계속 풀었더니 계속 60%에서 틀렸다.\n알고 보니 이 함수는 전체 str이 소문자인지, 대문자인지 구별하는 함수였고 소문자, 대문자가 섞여 들어오면 판별하지 못한다는 걸 너무 늦게 알았다. 딱 봐도 그렇게 생겼는데 생각이 너무 늦었다.\n\ndef GetSum(word: str): 이것도 오늘 처음 알게 된 문법인데 함수에 들어가는 파라미터에 type을 지정해줄 수 있었다. 기존에는 any로 받고 있었기에 이 함수 내에서 word의 자료형을 몰라 word.isupper() 같은 함수들이 자동 완성되지 않고 있었다. (이것 때문에 isupper() 썼으니 모르는게 좋았을지도 모른다.)\n\n소수 판별은 소프트웨어적사고에서 배운대로 2~n-1까지 다 볼 필요없고 2~ sqrt(n)까지만 보면 된다.\n다 풀고 나서 찾아보니 int(math.sqrt(sum)) + 1 → sum**0.5(sum^1/2)가 더 효율적이라 한다.",
        spans: [
          { text: "이 문제도 며칠 전에 풀었던 <" },
          { text: "싱기한 네자리>", bold: true },
          { text: "와 유사하게 ASC 대신 UTF를 이용하는 문제였다.\n문제를 꼼꼼하게 읽지 않아 1을 소수로 해준다는 것도 처리해주지 않았고,\na=1, A=27로 받는다는 걸 생각하지 않고 계속 " },
          { text: "ord('a')+1", code: true },
          { text: " 만 하고 있었다.\n\npy에 " },
          { text: "str.isupper()", code: true },
          { text: " 이런 말도 되는 함수가 있길래 이걸로 계속 풀었더니 계속 60%에서 틀렸다.\n알고 보니 이 함수는 전체 str이 소문자인지, 대문자인지 구별하는 함수였고 소문자, 대문자가 섞여 들어오면 판별하지 못한다는 걸 너무 늦게 알았다. 딱 봐도 그렇게 생겼는데 생각이 너무 늦었다.\n\n" },
          { text: "def GetSum(word: str):", code: true },
          { text: " 이것도 오늘 처음 알게 된 문법인데 함수에 들어가는 파라미터에 " },
          { text: "type", bold: true },
          { text: "을 지정해줄 수 있었다. 기존에는 any로 받고 있었기에 이 함수 내에서 word의 자료형을 몰라 " },
          { text: "word.isupper()", code: true },
          { text: " 같은 함수들이 자동 완성되지 않고 있었다. " },
          { text: "(이것 때문에 isupper() 썼으니 모르는게 좋았을지도 모른다.)\n\n", color: "gray" },
          { text: "소수 판별은 소프트웨어적사고에서 배운대로 ", color: "default_background" },
          { text: "2~n-1", bold: true, color: "default_background" },
          { text: "까지 다 볼 필요없고 ", color: "default_background" },
          { text: "2~ sqrt(n)", bold: true, color: "default_background" },
          { text: "까지만 보면 된다.\n다 풀고 나서 찾아보니 ", color: "default_background" },
          { text: "int(math.sqrt(sum)) + 1", code: true },
          { text: " → " },
          { text: "sum**0.5", code: true },
          { text: "(sum^1/2)", code: true, color: "gray" },
          { text: "가 더 효율적이라 한다." },
        ],
      },
      {
        kind: "code",
        lang: "Python",
        code: `import math

def GetSum(word: str):
    sum = 0

    for c in range(len(word)):
        if('A' <= word[c] <= 'Z'):
            sum += (ord(word[c]) - ord('A')+27)
        else:
            sum += (ord(word[c]) - ord('a')+1)

    return sum

def IsPrime(sum):

    if sum == 1:
        print("It is a prime word.")
        return

    for i in range(2, int(math.sqrt(sum)) + 1):
        if(sum%i == 0):
            print("It is not a prime word.")
            break
    else:
        print("It is a prime word.")
        
IsPrime(GetSum(input()))`,
      }
    ],
  },
  {
    id: "20260330",
    stamp: "20260330",
    problem: "싱기한 네자리 숫자",
    lang: "C#",
    links: [
      {
        href: "https://www.acmicpc.net/problem/6679",
        label: "[BOJ 6679] 싱기한 네자리 숫자",
      },
    ],
    pieces: [
      {
        kind: "text",
        text: "랜덤 마라톤이라는 기능이 있어서 한번 완주 해봤다 마지막 문제 나한테는 너무 어려웠다. \n이게 정해가 맞는건지도 잘 모르겠고 12진수가 너무 생소한데 직접 진수를 구현하려고 하니 너무 당황스러웠다…",
      },
      {
        kind: "text",
        text: "각 자리 문자열 구하기(12진수 변환 함수 구현하기) → 문자열 index 참조해 foreach(char) 돌려서 각 자리 합 구하기 → 조건 부합시, List에 넣어서 출력",
        spans: [
          { text: "각 자리 문자열 구하기" },
          { text: "(12진수 변환 함수 구현하기)", color: "gray" },
          { text: " → 문자열 index 참조해 foreach(char) 돌려서 각 자리 합 구하기 → 조건 부합시, List에 넣어서 출력" },
        ],
      },
      {
        kind: "text",
        text: "위처럼 구현하려고 했으나 일단 12진수 변환 함수 ToDuodecimal() 만드는 것부터 너무 힘들었다. \n그 뒤에는 각 자리 합을 구현하는데 아래처럼 radix == 12만 예외 처리 하고 합 구하는 코드는 최대한 재활용하려 했으나, 아 맞다 radix == 16도 문자열 처리 해줘야 한다는 걸 뒤늦게 알아 || 해줬다.\n\nConvert.ToInt32(c.ToString(), radix)는 2, 8, 16진수에 대해서만 변환해주기 때문에 오히려 10진수만 예외 처리해주면 됐다.\n\nswitch...case 로 구현 하려 했으나 너무 길어져서 찾아봤더니 ASC를 이용하는 방법이 있었다.\n만약 현재 문자 c가 'B'(66)라면, 여기서 'A'(65)를 빼면 'B' - 'A'  =>  66 - 65 = 1\n위에서 계산한 값은 'A'를 0으로 맞춘 값이기 때문에, 실제 진법의 값으로 만들려면 10을 더해줘야 한다.\n\nsum += Convert.ToInt32(c); 치명적인 실수. 여기서 c 넣으면 ASC 값 들어간다.\n→ sum += Convert.ToInt32(c.ToString());",
        spans: [
          { text: "위처럼 구현하려고 했으나 일단 12진수 변환 함수 " },
          { text: "ToDuodecimal()", code: true },
          { text: " 만드는 것부터 너무 힘들었다. \n그 뒤에는 각 자리 합을 구현하는데 아래처럼 " },
          { text: "radix == 12", code: true },
          { text: "만 예외 처리 하고 합 구하는 코드는 최대한 재활용하려 했으나, 아 맞다 " },
          { text: "radix == 16", code: true },
          { text: "도 문자열 처리 해줘야 한다는 걸 뒤늦게 알아 " },
          { text: "||", code: true },
          { text: " 해줬다.\n\n" },
          { text: "Convert.ToInt32(c.ToString(), radix)", code: true },
          { text: "는 2, 8, 16진수에 대해서만 변환해주기 때문에 오히려 10진수만 예외 처리해주면 됐다.\n\n" },
          { text: "switch...case", code: true },
          { text: " 로 구현 하려 했으나 너무 길어져서 찾아봤더니 ASC를 이용하는 방법이 있었다.\n만약 현재 문자 " },
          { text: "c", code: true },
          { text: "가 " },
          { text: "'B'(66)", code: true },
          { text: "라면, 여기서 " },
          { text: "'A'(65)", code: true },
          { text: "를 빼면 " },
          { text: "'B' - 'A'", code: true },
          { text: "  =>  " },
          { text: "66 - 65 = 1", code: true },
          { text: "\n위에서 계산한 값은 " },
          { text: "'A'", code: true },
          { text: "를 0으로 맞춘 값이기 때문에, 실제 진법의 값으로 만들려면 " },
          { text: "10", bold: true },
          { text: "을 더해줘야 한다.\n\n" },
          { text: "sum += Convert.ToInt32(c);", code: true },
          { text: " 치명적인 실수. 여기서 c 넣으면 ASC 값 들어간다.\n→ " },
          { text: "sum += Convert.ToInt32(c.ToString());", code: true },
        ],
      },
      {
        kind: "bullet",
        text: "c == Convert.ToChar(\"A\") → c == 'A' 아..  기억해두고 써먹자",
        spans: [
          { text: "c == Convert.ToChar(\"A\")", code: true },
          { text: " → " },
          { text: "c == 'A'", code: true },
          { text: " " },
          { text: "아..  기억해두고 써먹자", color: "gray" },
        ],
      },
      {
        kind: "code",
        lang: "C#",
        code: `namespace sleeeppy;

public class Program
{
    public static void Main()
    {
        int n = 1000;
        List<int> ansList = new List<int>();
        while (n <= 9999)
        {
            string decN = n.ToString();
            string duoN = ToDuodecimal(n);
            string hexN = Microsoft.VisualBasic.Conversion.Hex(n);

            int decSum = GetDigitSum(decN, 10);
            int duoSum = GetDigitSum(duoN, 12);
            int hexSum = GetDigitSum(hexN, 16);
            
            if ((hexSum == decSum) && (duoSum == decSum) && (hexSum == duoSum))
                ansList.Add(n);
            n++;
        }
        
        foreach (int i in ansList)
            Console.WriteLine(i);
    }

    public static string ToDuodecimal(int n)
    {
        if (n == 0) return "0";

        string result = "";
        string chars = "0123456789AB";

        while (n > 0)
        {
            result = chars[n % 12] + result;
            n /= 12;
        }

        return result;
    }

    public static int GetDigitSum(string n, int radix)
    {
        int sum = 0;
        foreach (char c in n)
        {
            if (radix == 12 ||  radix == 16)
            {
                // switch case ... 대신
                // -> ASC 차이 이용
                if (c >= 'A' && c <= 'F')
                    // A = 10부터 시작이니 +10
                    sum += (c - 'A' + 10);
                else
                    // 여기서 c.ToString 안 하면 ASC 들어감
                    sum += Convert.ToInt32(c.ToString());
            }
            else // 10진수
            {
                // 여기서 c.ToString 안 하면 ASC 들어감
                sum += Convert.ToInt32(c.ToString());
            }
        }
        return sum;
    }
}`,
      },
      {
        kind: "text",
        text: "이렇게 다 풀고나서 찾아봤더니 엄청 편한 방법이 있었다.\n생각해보니 각 자리 수의 합을 구할 때도 A=B, B=C ⇒ A=C를 이용해 두 가지만 판단하면 됐다.",
      },
      {
        kind: "text",
        text: "어쨌든, GetDigitSum() 이 말도 안되게 편해졌다. 각 자리를 진수(radix)로 나눠버리는 것이다.\n이러면 따로 A = 10, B = 11 … 를 처리하지 않아도 될 뿐더러, 12진수 변환 함수를 구현할 필요도 없다.",
        spans: [
          { text: "어쨌든, " },
          { text: "GetDigitSum()", code: true },
          { text: " 이 말도 안되게 편해졌다. 각 자리를 진수" },
          { text: "(radix)", color: "gray" },
          { text: "로 나눠버리는 것이다.\n이러면 따로 A = 10, B = 11 … 를 처리하지 않아도 될 뿐더러, 12진수 변환 함수를 구현할 필요도 없다." },
        ],
      },
      {
        kind: "code",
        lang: "C#",
        code: `        while (n <= 9999)
        {
            int decSum = GetDigitSum(n, 10);
            int duoSum = GetDigitSum(n, 12);
            int hexSum = GetDigitSum(n, 16);

            if (decSum == duoSum && duoSum == hexSum)
            {
                Console.WriteLine(n);
            }
            n++;
        }
        
    public static int GetDigitSum(int n, int radix)
    {
        int sum = 0;
        while (n > 0)
        {
            // 나머지 = 해당 자리의 숫자값 (A=10, B=11 자동처리)
            sum += n % radix;
            n /= radix;
        }
        return sum;
    }
}`,
      }
    ],
  },
  {
    id: "20260329",
    stamp: "20260329",
    problem: "설탕 배달",
    lang: "Python",
    links: [
      {
        href: "https://www.acmicpc.net/problem/2839",
        label: "[BOJ 2893] 설탕 배달",
      },
    ],
    pieces: [
      {
        kind: "text",
        text: "그리디그리디 문제 풀다가 막혀서 알고리즘 분류 보고 그리디 알고리즘 참고해서 풀었다. 아직 갈 길이 멀었다. 알고리즘 너무 어려움 ㅜㅠ ",
      },
      {
        kind: "text",
        text: "반복문을 안 쓰고 꼭 풀어보고 싶었는데 거의 1~2시간 정도 비비다가 ㅈㅈ쳐버렸다. 전에 반복문 써야하는 문제인데 패턴 찾아서 푼 적이 있었어서 이번에도 뭔가 될 줄 알고 어떻게든 해보려다가 실패했다.",
      },
      {
        kind: "code",
        lang: "Python",
        code: `n = int(input())
answer = 0

while(n>=0):
    if(n%5 == 0):
	    # 5가 가장 큰 단위의 수
        answer += n//5
        break;
    n-= 3
    answer += 1
else:
    answer = -1

print(answer)`,
      },
      {
        kind: "text",
        text: "[알고리즘] Greedy Algorithm(탐욕 알고리즘)",
        spans: [
          {
            text: "[알고리즘] Greedy Algorithm(탐욕 알고리즘)",
            href: "https://memodayoungee.tistory.com/103",
          },
        ],
      },
      {
        kind: "code",
        lang: "Python",
        code: `# cost : 960 (500*1 + 100*4 + 50*1 + 10*1)
# answer = 7

cash, cost = map(int, input().split())
n = cash - cost
answer = 0
arr = [500, 100, 50, 10]
for i in arr:
    if(n>=0):
        answer += n // i
        n -= i*(n // i)
    else:
        break

print(answer)`,
      }
    ],
  }
];

export function findEntry(id: string): Entry {
  return entries.find((entry) => entry.id === id) ?? entries[0];
}

export function excerpt(entry: Entry): string {
  const text = entry.pieces.find((piece) => piece.kind === "text" || piece.kind === "bullet");
  if (!text || (text.kind !== "text" && text.kind !== "bullet")) return entry.problem;
  const line = text.text.split("\n").find((row) => row.trim());
  return line?.trim() || entry.problem;
}
