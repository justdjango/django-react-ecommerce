import React, { Component } from "react";
import {
  CardElement,
  injectStripe,
  Elements,
  StripeProvider
} from "react-stripe-elements";
import {
  Button,
  Container,
  Dimmer,
  Divider,
  Form,
  Header,
  Image,
  Item,
  Label,
  Loader,
  Message,
  Segment
} from "semantic-ui-react";
import { authAxios } from "../utils";
import { checkoutURL, orderSummaryURL, addCouponURL } from "../constants";

const OrderPreview = props => {
  const { data } = props;
  return (
    <React.Fragment>
      {data && (
        <React.Fragment>
          <Item.Group relaxed>
            {data.order_items.map((orderItem, i) => {
              console.log(orderItem);
              return (
                <Item key={i}>
                  <Item.Image
                    size="tiny"
                    src={`http://127.0.0.1:8000${orderItem.item_obj.image}`}
                  />
                  <Item.Content verticalAlign="middle">
                    <Item.Header as="a">
                      {orderItem.quantity} x {orderItem.item_obj.title}
                    </Item.Header>
                    <Item.Extra>
                      <Label>${orderItem.final_price}</Label>
                    </Item.Extra>
                  </Item.Content>
                </Item>
              );
            })}
          </Item.Group>

          <Item.Group>
            <Item>
              <Item.Content>
                <Item.Header>
                  Order Total: ${data.total}
                  {data.coupon && (
                    <Label color="green" style={{ marginLeft: "10px" }}>
                      Current coupon: {data.coupon.code} for $
                      {data.coupon.amount}
                    </Label>
                  )}
                </Item.Header>
              </Item.Content>
            </Item>
          </Item.Group>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

class CouponForm extends Component {
  state = {
    code: ""
  };

  handleChange = e => {
    this.setState({
      code: e.target.value
    });
  };

  handleSubmit = e => {
    const { code } = this.state;
    this.props.handleAddCoupon(e, code);
    this.setState({ code: "" });
  };

  render() {
    const { code } = this.state;
    return (
      <React.Fragment>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Coupon code</label>
            <input
              placeholder="Enter a coupon.."
              value={code}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Button type="submit">Submit</Button>
        </Form>
      </React.Fragment>
    );
  }
}

class CheckoutForm extends Component {
  state = {
    data: null,
    loading: false,
    error: null,
    success: false
  };

  componentDidMount() {
    this.handleFetchOrder();
  }

  handleFetchOrder = () => {
    this.setState({ loading: true });
    authAxios
      .get(orderSummaryURL)
      .then(res => {
        this.setState({ data: res.data, loading: false });
      })
      .catch(err => {
        if (err.response.status === 404) {
          this.setState({
            error: "You currently do not have an order",
            loading: false
          });
        } else {
          this.setState({ error: err, loading: false });
        }
      });
  };

  handleAddCoupon = (e, code) => {
    e.preventDefault();
    this.setState({ loading: true });
    authAxios
      .post(addCouponURL, { code })
      .then(res => {
        this.setState({ loading: false });
        this.handleFetchOrder();
      })
      .catch(err => {
        this.setState({ error: err, loading: false });
      });
  };

  submit = ev => {
    ev.preventDefault();
    this.setState({ loading: true });
    if (this.props.stripe) {
      this.props.stripe.createToken().then(result => {
        if (result.error) {
          this.setState({ error: result.error.message, loading: false });
        } else {
          authAxios
            .post(checkoutURL, { stripeToken: result.token.id })
            .then(res => {
              this.setState({ loading: false, success: true });
              // redirect the user
            })
            .catch(err => {
              this.setState({ loading: false, error: err });
            });
        }
      });
    } else {
      console.log("Stripe is not loaded");
    }
  };

  render() {
    const { data, error, loading, success } = this.state;
    return (
      <div>
        {error && (
          <Message
            error
            header="There was some errors with your submission"
            content={JSON.stringify(error)}
          />
        )}
        {loading && (
          <Segment>
            <Dimmer active inverted>
              <Loader inverted>Loading</Loader>
            </Dimmer>
            <Image src="/images/wireframe/short-paragraph.png" />
          </Segment>
        )}
        {success && (
          <Message positive>
            <Message.Header>Your payment was successful</Message.Header>
            <p>
              Go to your <b>profile</b> to see the order delivery status.
            </p>
          </Message>
        )}

        <OrderPreview data={data} />
        <Divider />
        <CouponForm
          handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)}
        />
        <Divider />

        <Header>Would you like to complete the purchase?</Header>
        <CardElement />
        <Button
          loading={loading}
          disabled={loading}
          primary
          onClick={this.submit}
          style={{ marginTop: "10px" }}
        >
          Submit
        </Button>
      </div>
    );
  }
}

const InjectedForm = injectStripe(CheckoutForm);

const WrappedForm = () => (
  <Container text>
    <StripeProvider apiKey="">
      <div>
        <h1>Complete your order</h1>
        <Elements>
          <InjectedForm />
        </Elements>
      </div>
    </StripeProvider>
  </Container>
);

export default WrappedForm;
