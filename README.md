# What is this
This is an example for Property based testing using [fast-check](https://github.com/dubzzz/fast-check).
This test target is inspired from [test design contest U-30 class](http://aster.or.jp/business/contest/rulebooku30.html), which is specified as a test base
It is decided to be [Topic Boiling Pot Requirement Specification (GOMA-1015), 7th Edition](http://www.sessame.jp/workinggroup/WorkingGroup2/POT_Specification.htm).
Fast-check has [Model based testing](https://www.guru99.com/model-based-testing-tutorial.html) method to find test cases that fail by randomly walking the state, so I would like to try it on the repositly.

# What is Model based testing?
Model based testing is the following flow.
1. Define the behavior that the test target will behave and its state in a model.
2. Compare the behavior under test target with the results predicted by the model to confirm.

# Model based testing for fast-check
[Model Based Testing Tutorial: What is, Tools & Example] (https://www.guru99.com/model-based-testing-tutorial.html) explains it has many different types of models

- Data flow
- Control flow
- Dependency graph
- Decision table
- State transition machine

In this repository, I'll try using fast-check to test state transition machines.

# State transition diagram
Let's look at the state transition diagram 
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1817/373dba8d-4b24-707e-478e-a3a71ab61716.png)

It seems complicated, but the point is that 
it has the following 6 states

```JavaScript
OFF_CLOSE = -1,
OFF_OPEN, //0
ON_IDLE, //1
ON_OPEN, //2
ON_ACTIVE_BOIL, //3
ON_ACTIVE_KEEP, //4
```

and also it has the following 6 actions

- open() Opens the lid
- close() closes the lid
- fill() the water
- dispense() hot water
- reboil()
- Boil to keep boiling.


# Create a model
Model, in fast-check the action is defined in the form of a Command
also you can see test target on the source code[Goma1015](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/master/src/lib/index.ts), 
so Let's try to use  public field  state,water and temperature, and
Initialize it in constructor as in Goma1015.

```JavaScript
import fc from 'fast-check'

import { Goma1015, State } from '.../src/lib/index' /src/lib/index'

/** Class Goma1015Model */
export class Goma1015Model {
  /** to manage state transition */
  public state: number
  /** to manage water volume */
  public water: number
  /** to manage temperature
  public temperature: number
  constructor() {
    This.state = State.OFF_CLOSE
    this.water = 0
    this.temperature = 25
  }
}

export type Goma1015Command = fc.Command<Goma1015Model, Goma1015>
```

# Create an action
I want to find the unknown problem, so we leave each action executable in all states
and will compare the state of each model with the actual instance.

## open() open the lid condition: executable in all states
Test View point

- When open()  with OFF_CLOSE/OFF_OPEN, it should transit to OFF_OPEN
- When open() with other states, it should transit to ON_OPEN
- Water inside should not change 
- When you open the lid, the water temperature is going to be 25 degrees

[Source](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/feature/model-based/model_based/OpenCommand.ts)
## close() the lid conditions: executable in all states
Test View point

- When close()  with OFF_OPEN, it should transit to OFF_CLOSE
- When close()  with ON_OPEN, it should transit to ON_IDLE or ON_ACTIVE_BOIL
 - When the amount of water is 10 ml or more, it should transit to ON_ACTIVE_BOIL
    - After 1 second, the temperature must be above 25
 - When the amount of water is less than 10 ml, it should transit to ON_IDLE
- Water inside should not change 

[Source](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/feature/model-based/model_based/CloseCommand.ts)
## fill() fill with water condition: executable in all states
Test View point

- It should raise an error except OFF_OPEN state or ON_OPEN state
- If the water overflows, it should raise an error.
- When water is put in with OFF_OPEN state or ON_OPEN state .can water accumulate in the pot properly?

[Source](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/feature/model-based/model_based/FillCommand.ts)
## dispense() press the "dispense" button condition: executable in all states
Test View point

- It should raise an error except ON_IDLE state or ON_ACTIVE_KEEP state- If the amount of water is less than 10 ml as a result of water dispensing with ON_ACTIVE_KEEP, it should transit to ON_IDLE or
- If you press the dispense button in a state ON_IDLE or ON_ACTIVE_KEEP, hot water and water from the pot will be dispensed with collect amount.

[Source](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/feature/model-based/model_based/DispenseCommand.ts)
## reboil() Press reboil button Operation condition: executable in all states
Test View point

- It should raise an error except ON_ACTIVE_KEEP state
- If the reboil() button is pressed in the ON_ACTIVE_KEEP state, it goes to ON_ACTIVE_BOIL state.
- Water inside should not change.

[Source](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/feature/model-based/model_based/ReboilCommand.ts)
## boil to keep Wait until boiling. Condition: executable only during boiling state (not user input)
Test View point

- After 1 second, the temperature must be above 25
- When enough time has passed, the water temperature reaches 100 degrees and it should transit to ON_ACTIVE_KEEP.
- Water inside should not change.

[Source](https://raw.githubusercontent.com/freddiefujiwara/goma-1015/feature/model-based/model_based/BoilToKeepCommand.ts)

# Launch
You can see the actual state transition like this.
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1817/e14bacd8-11dd-124a-6b9d-dd39876a4345.png)

fast-check is testing a lot of different conditions.

I've made 10,000 state transitions and they've all passed!
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1817/4668dd3f-2f0b-7398-9725-07f381a9d6ff.png)


# Conclusion.
The actual Goma1015 has more functionality like a timer, multiple heat retention functions, and more, so the condition is more complicated.
This repository created as bottom-up style as much as possible, step by step.
I would like to create UI for that as an other repository.
Anyway I'm sohappy to try out the model-based testing with fast-check.
and any pull requests are welcomed.
That's all
