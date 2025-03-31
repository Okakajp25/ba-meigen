# How to use
1. .env.localをコピーして.envファイルを作成し、内容を全て埋めてください。
2. このスクリプトではすでにデータベースのデータが入ってしまっているので、消して利用してください。
```Shell
rm -rf prisma/dev.db
npx prisma migrate dev --name meigen
```
3. 実行しましょう。
```Shell
npm i
npm run start
```
