import React, { Component } from "react";
import { withRouter, RouteComponentProps } from "react-router";
import _ from "lodash";
import { Row, Col } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import DatePicker from "react-datepicker";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

import Router from "../../routing/router";

import { getMeals } from "../../services/meals";
import { getSetting } from "../../services/settings";
import MealDto from "../../dtos/meal";
import SettingTypeEnum from "../../enums/settingType";

import MealTileComponent from "../../components/mealTile";

import Images from "../../assets/images/images";
import styles from "./index.module.scss";

interface IFilters {
  startDate: Date;
  endDate: Date;
  startTime: Date;
  endTime: Date;
}

interface IMealsPageState {
  isPageLoading: boolean;
  filters: IFilters;
  meals: MealDto[];
  caloriesPerDay: number;
  validated: boolean;
}

class MealsPage extends Component<RouteComponentProps, IMealsPageState> {
  constructor(props: RouteComponentProps) {
    super(props);

    var lastMidnight = new Date();
    lastMidnight.setHours(0, 0, 0, 0);

    this.state = {
      isPageLoading: true,
      filters: {
        startDate: new Date(),
        endDate: new Date(),
        startTime: lastMidnight,
        endTime: lastMidnight
      },
      meals: [],
      caloriesPerDay: null,
      validated: false
    };
  }

  componentDidMount() {
    this.loadPageData();
  }

  loadPageData = async () => {
    await Promise.all([this.loadMeals(), this.loadSettings()]);
    this.setState({ isPageLoading: false });
  };

  loadMeals = async (): Promise<void> => {
    let meals = await getMeals(
      this.state.filters.startDate,
      this.state.filters.endDate,
      this.state.filters.startTime,
      this.state.filters.endTime
    );
    this.setState({
      meals: meals
    });
  };

  loadSettings = async (): Promise<void> => {
    let caloriesPerDaySetting = await getSetting(
      SettingTypeEnum.CaloriesPerDay
    );
    let caloriesPerDay = null;
    try {
      caloriesPerDay = parseInt(caloriesPerDaySetting.value);

      this.setState({
        caloriesPerDay: caloriesPerDay
      });
    } catch (e) {}
  };

  applyFilters = async event => {
    if (!this.state.isPageLoading) {
      this.setState({ isPageLoading: true });
      event.preventDefault();
      event.stopPropagation();

      const form = event.currentTarget;
      if (form.checkValidity() === true) {
        this.setState({ validated: false });

        try {
          await this.loadMeals();
        } catch (e) {}
      } else {
        this.setState({ validated: true });
      }

      this.setState({ isPageLoading: false });
    }
  };

  render() {
    var maxTime = new Date();
    maxTime.setHours(24, 0, 0, 0);
    maxTime.setMilliseconds(-1);

    return (
      <div className={styles.container}>
        <Accordion>
          <Card className={styles.filters}>
            <Accordion.Toggle as={Card.Header} eventKey="0">
              <div className={styles.filtersToggle}>
                <span>Filters</span>
                <Images.ArrowBottom
                  className={styles.arrowBottom}
                ></Images.ArrowBottom>
              </div>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <Form
                  noValidate
                  validated={this.state.validated}
                  onSubmit={this.applyFilters}
                >
                  <Form.Row>
                    <Form.Group as={Col} xs={12} md={6}>
                      <Form.Label>Start date:</Form.Label>
                      <DatePicker
                        locale="en-US"
                        dateFormat="Pp"
                        className="form-control"
                        wrapperClassName={styles.calendar}
                        selected={this.state.filters.startDate}
                        onChange={date => {
                          this.setState(state => {
                            return {
                              filters: {
                                ...state.filters,
                                startDate: date,
                                endDate: _.max([date, state.filters.endDate])
                              }
                            };
                          });
                        }}
                      />
                    </Form.Group>
                    <Form.Group as={Col} xs={12} md={6}>
                      <Form.Label>End date:</Form.Label>
                      <DatePicker
                        locale="en-US"
                        dateFormat="Pp"
                        className="form-control"
                        minDate={this.state.filters.startDate}
                        wrapperClassName={styles.calendar}
                        selected={this.state.filters.endDate}
                        onChange={date => {
                          this.setState(state => {
                            return {
                              filters: { ...state.filters, endDate: date }
                            };
                          });
                        }}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} xs={12} md={6}>
                      <Form.Label>Start time:</Form.Label>
                      <DatePicker
                        locale="en-US"
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeFormat="p"
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="form-control"
                        wrapperClassName={styles.calendar}
                        selected={this.state.filters.startTime}
                        onChange={time => {
                          this.setState(state => {
                            return {
                              filters: {
                                ...state.filters,
                                startTime: time,
                                endTime: _.max([time, state.filters.endTime])
                              }
                            };
                          });
                        }}
                      />
                    </Form.Group>
                    <Form.Group as={Col} xs={12} md={6}>
                      <Form.Label>End time:</Form.Label>
                      <DatePicker
                        locale="en-US"
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeFormat="p"
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        className="form-control"
                        minTime={this.state.filters.startTime}
                        maxTime={maxTime}
                        wrapperClassName={styles.calendar}
                        selected={this.state.filters.endTime}
                        onChange={time => {
                          this.setState(state => {
                            return {
                              filters: { ...state.filters, endTime: time }
                            };
                          });
                        }}
                      />
                    </Form.Group>
                  </Form.Row>
                  <Form.Row>
                    <Form.Group as={Col} md={6}>
                      {this.state.isPageLoading ? (
                        <Spinner
                          variant="success"
                          animation="border"
                          role="status"
                        ></Spinner>
                      ) : null}
                      <Button
                        disabled={this.state.isPageLoading}
                        variant="success"
                        type="submit"
                      >
                        Apply
                      </Button>
                    </Form.Group>
                  </Form.Row>
                </Form>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
        {this.state.isPageLoading ? (
          <Spinner animation="border" role="status" variant="success">
            <span className="sr-only">Loading...</span>
          </Spinner>
        ) : (
          <>
            <Row>
              <Form.Group as={Col} md={6}>
                <Button
                  className="mt-4"
                  variant="success"
                  onClick={() => Router.routes.addMeal.go()}
                >
                  Add meal
                </Button>
              </Form.Group>
            </Row>
            <Row>
              {this.state.meals.length
                ? _.chain(this.state.meals)
                    .groupBy(m => m.dateTimeCreated.toLocaleDateString())
                    .map((value, key) => {
                      let doesFitCaloriesLimit: boolean =
                        _.chain(value)
                          .sumBy(v => v.calories)
                          .value() <= this.state.caloriesPerDay;
                      let border: "success" | "danger" | null = this.state
                        .caloriesPerDay
                        ? doesFitCaloriesLimit
                          ? "success"
                          : "danger"
                        : null;
                      return {
                        key: key,
                        content: (
                          <Col key={key} className="mb-4" xs={12} md={6}>
                            <Card className="text-center" border={border}>
                              <Card.Header>{key}</Card.Header>
                              <Card.Body>
                                {_.chain(value)
                                  .orderBy(meal =>
                                    meal.dateTimeCreated.getTime()
                                  )
                                  .map((meal, index) => (
                                    <MealTileComponent
                                      key={index}
                                      meal={meal}
                                      onDelete={() =>
                                        this.setState(state => {
                                          return {
                                            meals: state.meals.filter(
                                              m => m !== meal
                                            )
                                          };
                                        })
                                      }
                                    ></MealTileComponent>
                                  ))
                                  .value()}
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      };
                    })
                    .orderBy(p => p.key)
                    .map(p => p.content)
                    .value()
                : null}
            </Row>
          </>
        )}
      </div>
    );
  }
}

export default withRouter(MealsPage);
